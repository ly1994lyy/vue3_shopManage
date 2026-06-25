<script setup lang="ts">
import { NButton, NCard, NDataTable, NForm, NFormItem, NGrid, NGridItem, NInput, NModal, NSelect, NSpace, NTag, useMessage } from 'naive-ui'
import { computed, h, reactive, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import StatusPill from '@/components/StatusPill.vue'
import { resolveErrorMessage } from '@/utils/error-message'
import {
  assignRolePermissionsApi,
  createRoleApi,
  getPermissionsApi,
  getRolesApi,
  updateRoleApi,
  type PermissionItem,
  type RoleItem,
  type RolePayload
} from '../api'

const { t } = useI18n()
const message = useMessage()
const loading = ref(false)
const roles = ref<RoleItem[]>([])
const permissions = ref<PermissionItem[]>([])
const roleModalVisible = ref(false)
const permissionModalVisible = ref(false)
const currentRole = ref<RoleItem | null>(null)
const selectedPermissionCodes = ref<string[]>([])
const roleForm = reactive<RolePayload>({
  name: '',
  code: '',
  scope: 'tenant',
  description: ''
})

const scopeOptions = computed(() => [
  { label: t('access.scope.platform'), value: 'platform' },
  { label: t('access.scope.tenant'), value: 'tenant' }
])

const permissionOptions = computed(() =>
  permissions.value.map((permission) => ({
    label: `${permission.name} / ${permission.code}`,
    value: permission.code
  }))
)

const roleColumns = computed(() => [
  { title: t('access.columns.name'), key: 'name' },
  { title: t('access.columns.code'), key: 'code' },
  {
    title: t('access.columns.scope'),
    key: 'scope',
    render: (row: RoleItem) => row.scope === 'platform' ? t('access.scope.platform') : t('access.scope.tenant')
  },
  {
    title: t('access.columns.permissions'),
    key: 'permissions',
    render: (row: RoleItem) => row.rolePermissions?.length || 0
  },
  {
    title: t('common.actions'),
    key: 'actions',
    render: (row: RoleItem) =>
      h(NSpace, null, {
        default: () => [
          h(NButton, { size: 'small', quaternary: true, onClick: () => openEditRole(row) }, { default: () => t('access.actions.edit') }),
          h(NButton, { size: 'small', quaternary: true, type: 'primary', onClick: () => openAssignPermissions(row) }, { default: () => t('access.actions.assign') })
        ]
      })
  }
])

const permissionColumns = computed(() => [
  { title: t('access.columns.name'), key: 'name' },
  { title: t('access.columns.code'), key: 'code' },
  {
    title: t('access.columns.type'),
    key: 'type',
    render: (row: PermissionItem) => row.type
  }
])

async function loadAccessData() {
  loading.value = true

  try {
    const [roleResponse, permissionResponse] = await Promise.all([getRolesApi(), getPermissionsApi()])
    roles.value = roleResponse.data
    permissions.value = permissionResponse.data
  } catch (error) {
    message.error(resolveErrorMessage(error))
  } finally {
    loading.value = false
  }
}

function resetRoleForm() {
  currentRole.value = null
  roleForm.name = ''
  roleForm.code = ''
  roleForm.scope = 'tenant'
  roleForm.description = ''
}

function openCreateRole() {
  resetRoleForm()
  roleModalVisible.value = true
}

function openEditRole(role: RoleItem) {
  currentRole.value = role
  roleForm.name = role.name
  roleForm.code = role.code
  roleForm.scope = role.scope
  roleForm.description = role.description || ''
  roleModalVisible.value = true
}

async function saveRole() {
  try {
    if (currentRole.value) {
      await updateRoleApi(currentRole.value.id, {
        name: roleForm.name,
        description: roleForm.description
      })
    } else {
      await createRoleApi(roleForm)
    }

    message.success(t('access.messages.saved'))
    roleModalVisible.value = false
    await loadAccessData()
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

function openAssignPermissions(role: RoleItem) {
  currentRole.value = role
  selectedPermissionCodes.value = role.rolePermissions?.map((item) => item.permission.code) || []
  permissionModalVisible.value = true
}

async function saveRolePermissions() {
  if (!currentRole.value) return

  try {
    await assignRolePermissionsApi(currentRole.value.id, selectedPermissionCodes.value)
    message.success(t('access.messages.assigned'))
    permissionModalVisible.value = false
    await loadAccessData()
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

onMounted(loadAccessData)
</script>

<template>
  <div class="space-y-6">
    <NGrid :cols="2" :x-gap="24">
      <NGridItem>
        <NCard class="!rounded-3xl" :bordered="false">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-slate-500">
              {{ t('access.rolesTip') }}
              <span v-if="roles.length > 0" class="ml-2 text-slate-400">· 共 {{ roles.length }} 条</span>
            </span>
            <NButton type="primary" @click="openCreateRole">{{ t('access.actions.createRole') }}</NButton>
          </div>
          <NDataTable :loading="loading" :columns="roleColumns" :data="roles" :bordered="false" />
        </NCard>
      </NGridItem>
      <NGridItem>
        <NCard class="!rounded-3xl" :bordered="false">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-slate-500">
              {{ t('access.permissionsTip') }}
              <span v-if="permissions.length > 0" class="ml-2 text-slate-400">· 共 {{ permissions.length }} 条</span>
            </span>
            <StatusPill label="RBAC" tone="info" />
          </div>
          <NDataTable :loading="loading" :columns="permissionColumns" :data="permissions" :bordered="false" />
          <div class="mt-4 flex flex-wrap gap-2">
            <NTag v-for="permission in permissions.slice(0, 8)" :key="permission.id" round size="small">
              {{ permission.code }}
            </NTag>
          </div>
        </NCard>
      </NGridItem>
    </NGrid>

    <NModal v-model:show="roleModalVisible" preset="card" :title="currentRole ? t('access.actions.edit') : t('access.actions.createRole')" class="max-w-xl">
      <NForm :model="roleForm" label-placement="top">
        <NFormItem :label="t('access.form.roleName')">
          <NInput v-model:value="roleForm.name" />
        </NFormItem>
        <NFormItem :label="t('access.form.roleCode')">
          <NInput v-model:value="roleForm.code" :disabled="Boolean(currentRole)" />
        </NFormItem>
        <NFormItem :label="t('access.form.roleScope')">
          <NSelect v-model:value="roleForm.scope" :options="scopeOptions" :disabled="Boolean(currentRole)" />
        </NFormItem>
        <NFormItem :label="t('access.form.description')">
          <NInput v-model:value="roleForm.description" type="textarea" />
        </NFormItem>
      </NForm>
      <template #footer>
        <div class="flex justify-end gap-3">
          <NButton @click="roleModalVisible = false">{{ t('access.actions.cancel') }}</NButton>
          <NButton type="primary" @click="saveRole">{{ t('access.actions.save') }}</NButton>
        </div>
      </template>
    </NModal>

    <NModal v-model:show="permissionModalVisible" preset="card" :title="t('access.actions.assign')" class="max-w-2xl">
      <NForm label-placement="top">
        <NFormItem :label="t('access.form.permissions')">
          <NSelect
            v-model:value="selectedPermissionCodes"
            multiple
            filterable
            :options="permissionOptions"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <div class="flex justify-end gap-3">
          <NButton @click="permissionModalVisible = false">{{ t('access.actions.cancel') }}</NButton>
          <NButton type="primary" @click="saveRolePermissions">{{ t('access.actions.save') }}</NButton>
        </div>
      </template>
    </NModal>
  </div>
</template>
