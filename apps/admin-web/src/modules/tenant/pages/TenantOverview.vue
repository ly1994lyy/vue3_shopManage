<script setup lang="ts">
import { NButton, NCard, NDatePicker, NForm, NFormItem, NInput, NModal, NSelect, NSpace, NTag, useMessage } from 'naive-ui'
import type { DataTableColumns, DataTableSortState } from 'naive-ui'
import type { TenantSummary } from '@shop-saas/types'
import { computed, h, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DataTable from '@/components/DataTable.vue'
import PermissionButton from '@/components/PermissionButton.vue'
import SearchForm from '@/components/SearchForm.vue'
import StatusPill from '@/components/StatusPill.vue'
import { resolveErrorMessage } from '@/utils/error-message'
import {
  createTenantApi,
  initTenantAdminApi,
  updateTenantApi,
  getTenantsApi,
  renewTenantApi,
  type CreateTenantPayload,
  type InitTenantAdminPayload,
  type TenantPlan,
  type TenantStatus
} from '../api'

const { t } = useI18n()
const message = useMessage()
const loading = ref(false)
const modalVisible = ref(false)
const adminModalVisible = ref(false)
const renewModalVisible = ref(false)
const currentTenant = ref<TenantSummary | null>(null)
const tenants = ref<TenantSummary[]>([])
const total = ref(0)
const query = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  status: undefined as TenantStatus | undefined,
  plan: undefined as TenantPlan | undefined,
  sortBy: 'expiredAt' as 'expiredAt' | 'createdAt' | 'name',
  sortOrder: 'asc' as 'asc' | 'desc'
})
const tenantForm = reactive<Omit<CreateTenantPayload, 'expiredAt'> & { status?: TenantStatus; expiredAt: number | null }>({
  name: '',
  code: '',
  contact: '',
  phone: '',
  email: '',
  status: 'active',
  plan: 'starter',
  expiredAt: null
})
const adminForm = reactive<InitTenantAdminPayload>({
  account: '',
  password: '123456',
  name: '',
  email: ''
})
const renewForm = reactive({
  months: 12
})

const statusOptions = computed(() => [
  { label: t('tenant.status.pending'), value: 'pending' },
  { label: t('tenant.status.active'), value: 'active' },
  { label: t('tenant.status.disabled'), value: 'disabled' },
  { label: t('tenant.status.expired'), value: 'expired' }
])

const planOptions = computed(() => [
  { label: t('tenant.plan.starter'), value: 'starter' },
  { label: t('tenant.plan.standard'), value: 'standard' },
  { label: t('tenant.plan.pro'), value: 'pro' },
  { label: t('tenant.plan.enterprise'), value: 'enterprise' }
])

const searchFields = computed(() => [
  {
    key: 'keyword',
    label: '',
    type: 'input' as const,
    placeholder: t('tenant.searchPlaceholder'),
    width: '220px'
  },
  {
    key: 'status',
    label: '',
    type: 'select' as const,
    placeholder: '状态',
    options: statusOptions.value,
    width: '144px'
  },
  {
    key: 'plan',
    label: '',
    type: 'select' as const,
    placeholder: '套餐',
    options: planOptions.value,
    width: '144px'
  }
])

const monthsOptions = computed(() =>
  [1, 3, 6, 12, 24, 36].map((n) => ({
    label: `${n} 个月`,
    value: n
  }))
)

const columns = computed<DataTableColumns<TenantSummary>>(() => [
  {
    title: t('tenant.columns.name'),
    key: 'name',
    sorter: true,
    sortOrder: query.sortBy === 'name' ? (query.sortOrder === 'asc' ? 'ascend' : 'descend') : false
  },
  { title: t('tenant.columns.contact'), key: 'contact' },
  {
    title: t('tenant.columns.plan'),
    key: 'plan',
    render: (row: TenantSummary) =>
      h(NTag, { round: true, size: 'small', type: planTagType(row.plan) }, { default: () => t(`tenant.plan.${row.plan}`) })
  },
  {
    title: t('tenant.columns.status'),
    key: 'status',
    render: (row: TenantSummary) =>
      h(NTag, { round: true, type: statusTagType(row.status) }, { default: () => t(`tenant.status.${row.status}`) })
  },
  {
    title: t('tenant.columns.expiredAt'),
    key: 'expiredAt',
    sorter: true,
    sortOrder: query.sortBy === 'expiredAt' ? (query.sortOrder === 'asc' ? 'ascend' : 'descend') : false,
    render: (row: TenantSummary) =>
      row.expiredAt ? new Date(row.expiredAt).toLocaleDateString() : t('tenant.neverExpire')
  },
  {
    title: t('tenant.columns.daysRemaining'),
    key: 'daysRemaining',
    render: (row: TenantSummary) => {
      const days = row.daysRemaining
      if (days == null) return h('span', { class: 'text-slate-400' }, t('tenant.neverExpire'))
      if (days <= 0) {
        return h(NTag, { round: true, size: 'small', type: 'error' }, {
          default: () => t('tenant.daysExpired', { days: Math.abs(days) })
        })
      }
      if (days <= 7) {
        return h(NTag, { round: true, size: 'small', type: 'error' }, {
          default: () => t('tenant.daysRemaining', { days })
        })
      }
      if (days <= 30) {
        return h(NTag, { round: true, size: 'small', type: 'warning' }, {
          default: () => t('tenant.daysRemaining', { days })
        })
      }
      return h('span', { class: 'text-slate-600 dark:text-slate-300' }, t('tenant.daysRemaining', { days }))
    }
  },
  {
    title: t('common.actions'),
    key: 'actions',
    render: (row: TenantSummary) =>
      h(NSpace, null, {
        default: () => [
          h(PermissionButton, { permission: 'tenant:update:submit', size: 'small', type: 'primary', onClick: () => openEditTenant(row) }, { default: () => t('tenant.actions.edit') }),
          h(PermissionButton, { permission: 'tenant:update:submit', size: 'small', onClick: () => openRenewTenant(row) }, { default: () => t('tenant.actions.renew') }),
          h(PermissionButton, { permission: 'tenant:update:submit', size: 'small', onClick: () => toggleTenantStatus(row) }, { default: () => row.status === 'active' ? t('tenant.actions.disable') : t('tenant.actions.enable') }),
          h(PermissionButton, { permission: 'tenant:admin:init', size: 'small', onClick: () => openInitAdmin(row) }, { default: () => t('tenant.actions.initAdmin') })
        ]
      })
  }
])

function statusTagType(status: string) {
  const map: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    active: 'success',
    pending: 'info',
    disabled: 'warning',
    expired: 'error'
  }
  return map[status] || 'default'
}

function planTagType(plan: string) {
  const map: Record<string, 'success' | 'info' | 'warning' | 'primary'> = {
    starter: 'info',
    standard: 'success',
    pro: 'warning',
    enterprise: 'primary'
  }
  return map[plan] || 'default'
}

function formatIsoDate(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return Number.isNaN(d.getTime()) ? null : d.getTime()
}

async function loadTenants() {
  loading.value = true

  try {
    const response = await getTenantsApi(query)
    tenants.value = response.data.list
    total.value = response.data.pagination.total
  } catch (error) {
    message.error(resolveErrorMessage(error))
  } finally {
    loading.value = false
  }
}

function resetTenantForm() {
  currentTenant.value = null
  tenantForm.name = ''
  tenantForm.code = ''
  tenantForm.contact = ''
  tenantForm.phone = ''
  tenantForm.email = ''
  tenantForm.status = 'active'
  tenantForm.plan = 'starter'
  tenantForm.expiredAt = null
}

function openCreateTenant() {
  resetTenantForm()
  modalVisible.value = true
}

function openEditTenant(tenant: TenantSummary) {
  currentTenant.value = tenant
  tenantForm.name = tenant.name
  tenantForm.code = tenant.code || ''
  tenantForm.contact = tenant.contact || ''
  tenantForm.phone = tenant.phone || ''
  tenantForm.email = tenant.email || ''
  tenantForm.status = tenant.status
  tenantForm.plan = tenant.plan
  tenantForm.expiredAt = formatIsoDate(tenant.expiredAt)
  modalVisible.value = true
}

function openRenewTenant(tenant: TenantSummary) {
  currentTenant.value = tenant
  renewForm.months = 12
  renewModalVisible.value = true
}

async function saveTenant() {
  try {
    const expiryValue: string | null =
      tenantForm.expiredAt == null ? null : new Date(tenantForm.expiredAt).toISOString()

    if (currentTenant.value) {
      await updateTenantApi(currentTenant.value.id, {
        name: tenantForm.name,
        contact: tenantForm.contact,
        phone: tenantForm.phone,
        email: tenantForm.email,
        status: tenantForm.status,
        plan: tenantForm.plan,
        expiredAt: expiryValue
      })
      message.success(t('tenant.messages.updated'))
    } else {
      await createTenantApi({
        name: tenantForm.name,
        code: tenantForm.code,
        contact: tenantForm.contact,
        phone: tenantForm.phone,
        email: tenantForm.email,
        status: tenantForm.status,
        plan: tenantForm.plan,
        expiredAt: expiryValue
      })
      message.success(t('tenant.messages.created'))
    }

    modalVisible.value = false
    await loadTenants()
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

async function saveRenew() {
  if (!currentTenant.value) return

  try {
    await renewTenantApi(currentTenant.value.id, {
      months: renewForm.months
    })
    message.success(t('tenant.messages.renewed'))
    renewModalVisible.value = false
    await loadTenants()
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

async function toggleTenantStatus(tenant: TenantSummary) {
  try {
    await updateTenantApi(tenant.id, {
      status: tenant.status === 'active' ? 'disabled' : 'active'
    })
    message.success(t('tenant.messages.updated'))
    await loadTenants()
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

function openInitAdmin(tenant: TenantSummary) {
  currentTenant.value = tenant
  adminForm.account = `${tenant.code || 'tenant'}_admin`
  adminForm.password = '123456'
  adminForm.name = t('tenant.admin.defaultName')
  adminForm.email = ''
  adminModalVisible.value = true
}

async function saveTenantAdmin() {
  if (!currentTenant.value) return

  try {
    await initTenantAdminApi(currentTenant.value.id, adminForm)
    message.success(t('tenant.messages.adminInitialized'))
    adminModalVisible.value = false
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

function handleSearch() {
  query.page = 1
  loadTenants()
}

function handleReset() {
  query.page = 1
  loadTenants()
}

function handleSorterChange(sorter: DataTableSortState | null) {
  if (!sorter || !sorter.order) {
    query.sortBy = 'expiredAt'
    query.sortOrder = 'asc'
  } else {
    const key = sorter.columnKey
    if (key === 'expiredAt' || key === 'name' || key === 'createdAt') {
      query.sortBy = key
      query.sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc'
    }
  }
  query.page = 1
  loadTenants()
}

onMounted(loadTenants)
</script>

<template>
  <div class="space-y-6">
    <NCard class="!rounded-3xl" :bordered="false">
      <SearchForm
        v-model="query"
        :fields="searchFields"
        :loading="loading"
        :search-label="t('common.search')"
        :reset-label="t('common.reset')"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #actions>
          <PermissionButton permission="tenant:create:submit" type="primary" @click="openCreateTenant">{{ t('tenant.create') }}</PermissionButton>
        </template>
      </SearchForm>
      <DataTable
        :loading="loading"
        :columns="columns"
        :data="tenants"
        @update:sorter="handleSorterChange"
        :pagination="{
          page: query.page,
          pageSize: query.pageSize,
          itemCount: total,
          onChange: (page: number) => { query.page = page; loadTenants() }
        }"
        @change="(page: number, pageSize?: number) => { query.page = page; if (pageSize) query.pageSize = pageSize; loadTenants() }"
      />
      <div class="mt-4 flex gap-2">
        <StatusPill label="tenant_id 强制隔离" tone="success" />
        <StatusPill label="平台跨租户监管" />
        <StatusPill label="租户套餐已启用" tone="success" />
      </div>
    </NCard>

    <NModal v-model:show="modalVisible" preset="card" :title="currentTenant ? t('tenant.actions.edit') : t('tenant.create')" class="max-w-xl">
      <NForm :model="tenantForm" label-placement="top">
        <NFormItem :label="t('tenant.columns.name')">
          <NInput v-model:value="tenantForm.name" />
        </NFormItem>
        <NFormItem :label="t('tenant.columns.code')">
          <NInput v-model:value="tenantForm.code" :disabled="Boolean(currentTenant)" />
        </NFormItem>
        <NFormItem :label="t('tenant.columns.plan')">
          <NSelect v-model:value="tenantForm.plan" :options="planOptions" />
        </NFormItem>
        <NFormItem :label="t('tenant.columns.expiredAt')">
          <NDatePicker v-model:value="tenantForm.expiredAt" type="date" clearable />
        </NFormItem>
        <NFormItem :label="t('tenant.columns.status')">
          <NSelect v-model:value="tenantForm.status" :options="statusOptions" />
        </NFormItem>
        <NFormItem :label="t('tenant.columns.contact')">
          <NInput v-model:value="tenantForm.contact" />
        </NFormItem>
        <NFormItem :label="t('tenant.columns.phone')">
          <NInput v-model:value="tenantForm.phone" />
        </NFormItem>
        <NFormItem :label="t('tenant.columns.email')">
          <NInput v-model:value="tenantForm.email" />
        </NFormItem>
      </NForm>
      <template #footer>
        <div class="flex justify-end gap-3">
          <NButton @click="modalVisible = false">{{ t('access.actions.cancel') }}</NButton>
          <NButton type="primary" @click="saveTenant">{{ t('access.actions.save') }}</NButton>
        </div>
      </template>
    </NModal>

    <NModal v-model:show="renewModalVisible" preset="card" :title="t('tenant.actions.renew')" class="max-w-sm">
      <NForm :model="renewForm" label-placement="top">
        <NFormItem :label="t('tenant.renewFor')">
          <NSelect v-model:value="renewForm.months" :options="monthsOptions" />
        </NFormItem>
        <div class="text-sm text-slate-500">
          {{ t('tenant.renewHint', { tenant: currentTenant?.name }) }}
        </div>
      </NForm>
      <template #footer>
        <div class="flex justify-end gap-3">
          <NButton @click="renewModalVisible = false">{{ t('access.actions.cancel') }}</NButton>
          <NButton type="primary" @click="saveRenew">{{ t('access.actions.save') }}</NButton>
        </div>
      </template>
    </NModal>

    <NModal v-model:show="adminModalVisible" preset="card" :title="t('tenant.actions.initAdmin')" class="max-w-xl">
      <NForm :model="adminForm" label-placement="top">
        <NFormItem :label="t('auth.account')">
          <NInput v-model:value="adminForm.account" />
        </NFormItem>
        <NFormItem :label="t('auth.password')">
          <NInput v-model:value="adminForm.password" type="password" show-password-on="click" />
        </NFormItem>
        <NFormItem :label="t('user.columns.name')">
          <NInput v-model:value="adminForm.name" />
        </NFormItem>
        <NFormItem :label="t('user.columns.email')">
          <NInput v-model:value="adminForm.email" />
        </NFormItem>
      </NForm>
      <template #footer>
        <div class="flex justify-end gap-3">
          <NButton @click="adminModalVisible = false">{{ t('access.actions.cancel') }}</NButton>
          <NButton type="primary" @click="saveTenantAdmin">{{ t('access.actions.save') }}</NButton>
        </div>
      </template>
    </NModal>
  </div>
</template>
