<script setup lang="ts">
import { NButton, NCard, NForm, NFormItem, NInput, NModal, NSelect, NSpace, NTag, useMessage } from 'naive-ui'
import { computed, h, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DataTable from '@/components/DataTable.vue'
import SearchForm from '@/components/SearchForm.vue'
import { getRolesApi, type RoleItem } from '@/modules/access/api'
import { resolveErrorMessage } from '@/utils/error-message'
import {
  assignUserRolesApi,
  createUserApi,
  getUsersApi,
  resetUserPasswordApi,
  updateUserApi,
  type CreateUserPayload,
  type UserItem
} from '../api'

const { t } = useI18n()
const message = useMessage()
const loading = ref(false)
const users = ref<UserItem[]>([])
const roles = ref<RoleItem[]>([])
const total = ref(0)
const modalVisible = ref(false)
const roleModalVisible = ref(false)
const passwordModalVisible = ref(false)
const currentUser = ref<UserItem | null>(null)
const selectedRoleIds = ref<string[]>([])
const passwordForm = reactive({ password: '123456' })
const query = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  status: undefined as 'active' | 'disabled' | undefined
})

const statusOptions = computed(() => [
  { label: t('user.status.active'), value: 'active' },
  { label: t('user.status.disabled'), value: 'disabled' }
])

const searchFields = computed(() => [
  {
    key: 'keyword',
    label: '',
    type: 'input' as const,
    placeholder: t('user.searchPlaceholder'),
    width: '220px'
  },
  {
    key: 'status',
    label: '',
    type: 'select' as const,
    placeholder: '请选择状态',
    options: statusOptions.value,
    width: '144px'
  }
])

const userForm = reactive<CreateUserPayload & { status?: 'active' | 'disabled' }>({
  account: '',
  password: '123456',
  name: '',
  email: '',
  type: 'tenant',
  status: 'active'
})

const typeOptions = computed(() => [
  { label: t('user.type.platform'), value: 'platform' },
  { label: t('user.type.tenant'), value: 'tenant' },
  { label: t('user.type.customer'), value: 'customer' }
])

const roleOptions = computed(() =>
  roles.value.map((role) => ({
    label: `${role.name} / ${role.code}`,
    value: role.id
  }))
)

const columns = computed(() => [
  { title: t('user.columns.account'), key: 'account' },
  { title: t('user.columns.name'), key: 'name' },
  { title: t('user.columns.email'), key: 'email' },
  {
    title: t('user.columns.type'),
    key: 'type',
    render: (row: UserItem) => t(`user.type.${row.type}`)
  },
  {
    title: t('user.columns.status'),
    key: 'status',
    render: (row: UserItem) =>
      h(NTag, { round: true, type: row.status === 'active' ? 'success' : 'warning' }, { default: () => t(`user.status.${row.status}`) })
  },
  {
    title: t('user.columns.roles'),
    key: 'roles',
    render: (row: UserItem) => row.userRoles?.map((item) => item.role.name).join(', ') || '-'
  },
  {
    title: t('common.actions'),
    key: 'actions',
    render: (row: UserItem) =>
      h(NSpace, null, {
        default: () => [
          h(NButton, { size: 'small', quaternary: true, type: 'primary', onClick: () => openEditUser(row) }, { default: () => t('user.actions.edit') }),
          h(NButton, { size: 'small', quaternary: true, onClick: () => openAssignRoles(row) }, { default: () => t('user.actions.assignRoles') }),
          h(NButton, { size: 'small', quaternary: true, onClick: () => openResetPassword(row) }, { default: () => t('user.actions.resetPassword') })
        ]
      })
  }
])

async function loadUsers() {
  loading.value = true

  try {
    const response = await getUsersApi(query)
    users.value = response.data.list
    total.value = response.data.pagination.total
  } catch (error) {
    message.error(resolveErrorMessage(error))
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.page = 1
  loadUsers()
}

function handleReset() {
  query.page = 1
  loadUsers()
}

async function loadRoles() {
  try {
    const response = await getRolesApi()
    roles.value = response.data
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

function resetUserForm() {
  currentUser.value = null
  userForm.account = ''
  userForm.password = '123456'
  userForm.name = ''
  userForm.email = ''
  userForm.type = 'tenant'
  userForm.status = 'active'
}

function openCreateUser() {
  resetUserForm()
  modalVisible.value = true
}

function openEditUser(user: UserItem) {
  currentUser.value = user
  userForm.account = user.account
  userForm.name = user.name
  userForm.email = user.email || ''
  userForm.type = user.type
  userForm.status = user.status
  modalVisible.value = true
}

async function saveUser() {
  try {
    if (currentUser.value) {
      await updateUserApi(currentUser.value.id, {
        name: userForm.name,
        email: userForm.email,
        status: userForm.status
      })
    } else {
      await createUserApi(userForm)
    }

    message.success(t('user.messages.saved'))
    modalVisible.value = false
    await loadUsers()
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

function openAssignRoles(user: UserItem) {
  currentUser.value = user
  selectedRoleIds.value = user.userRoles?.map((item) => item.role.id) || []
  roleModalVisible.value = true
}

async function saveUserRoles() {
  if (!currentUser.value) return

  try {
    await assignUserRolesApi(currentUser.value.id, selectedRoleIds.value)
    message.success(t('user.messages.assigned'))
    roleModalVisible.value = false
    await loadUsers()
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

function openResetPassword(user: UserItem) {
  currentUser.value = user
  passwordForm.password = '123456'
  passwordModalVisible.value = true
}

async function saveUserPassword() {
  if (!currentUser.value) return

  try {
    await resetUserPasswordApi(currentUser.value.id, passwordForm.password)
    message.success(t('user.messages.passwordReset'))
    passwordModalVisible.value = false
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

onMounted(() => {
  loadUsers()
  loadRoles()
})
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
          <NButton type="primary" @click="openCreateUser">{{ t('user.actions.create') }}</NButton>
        </template>
      </SearchForm>

      <DataTable
        :columns="columns"
        :data="users"
        :loading="loading"
        :pagination="{
          page: query.page,
          pageSize: query.pageSize,
          itemCount: total,
          onChange: (page: number) => { query.page = page; loadUsers() }
        }"
        @change="(page: number, pageSize?: number) => { query.page = page; if (pageSize) query.pageSize = pageSize; loadUsers() }"
      />
    </NCard>

    <NModal v-model:show="modalVisible" preset="card" :title="currentUser ? t('user.actions.edit') : t('user.actions.create')" class="max-w-xl">
      <NForm :model="userForm" label-placement="top">
        <NFormItem :label="t('user.columns.account')">
          <NInput v-model:value="userForm.account" :disabled="Boolean(currentUser)" />
        </NFormItem>
        <NFormItem v-if="!currentUser" :label="t('user.form.password')">
          <NInput v-model:value="userForm.password" type="password" show-password-on="click" />
        </NFormItem>
        <NFormItem :label="t('user.columns.name')">
          <NInput v-model:value="userForm.name" />
        </NFormItem>
        <NFormItem :label="t('user.columns.email')">
          <NInput v-model:value="userForm.email" />
        </NFormItem>
        <NFormItem :label="t('user.columns.type')">
          <NSelect v-model:value="userForm.type" :options="typeOptions" :disabled="Boolean(currentUser)" />
        </NFormItem>
        <NFormItem :label="t('user.columns.status')">
          <NSelect v-model:value="userForm.status" :options="statusOptions" />
        </NFormItem>
      </NForm>
      <template #footer>
        <div class="flex justify-end gap-3">
          <NButton @click="modalVisible = false">{{ t('access.actions.cancel') }}</NButton>
          <NButton type="primary" @click="saveUser">{{ t('access.actions.save') }}</NButton>
        </div>
      </template>
    </NModal>

    <NModal v-model:show="roleModalVisible" preset="card" :title="t('user.actions.assignRoles')" class="max-w-2xl">
      <NForm label-placement="top">
        <NFormItem :label="t('user.form.roles')">
          <NSelect v-model:value="selectedRoleIds" multiple filterable :options="roleOptions" />
        </NFormItem>
      </NForm>
      <template #footer>
        <div class="flex justify-end gap-3">
          <NButton @click="roleModalVisible = false">{{ t('access.actions.cancel') }}</NButton>
          <NButton type="primary" @click="saveUserRoles">{{ t('access.actions.save') }}</NButton>
        </div>
      </template>
    </NModal>

    <NModal v-model:show="passwordModalVisible" preset="card" :title="t('user.actions.resetPassword')" class="max-w-md">
      <NForm :model="passwordForm" label-placement="top">
        <NFormItem :label="t('user.form.password')">
          <NInput v-model:value="passwordForm.password" type="password" show-password-on="click" />
        </NFormItem>
      </NForm>
      <template #footer>
        <div class="flex justify-end gap-3">
          <NButton @click="passwordModalVisible = false">{{ t('access.actions.cancel') }}</NButton>
          <NButton type="primary" @click="saveUserPassword">{{ t('access.actions.save') }}</NButton>
        </div>
      </template>
    </NModal>
  </div>
</template>
