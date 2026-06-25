import { get, patch, post } from '@shop-saas/api-client'

export interface PermissionItem {
  id: string
  name: string
  code: string
  type: 'menu' | 'page' | 'button' | 'api' | 'data'
  description?: string | null
}

export interface RoleItem {
  id: string
  tenantId?: string | null
  name: string
  code: string
  description?: string | null
  scope: 'platform' | 'tenant'
  rolePermissions?: Array<{
    permission: PermissionItem
  }>
}

export interface RolePayload {
  name: string
  code: string
  scope?: 'platform' | 'tenant'
  description?: string
}

export async function getRolesApi() {
  return get<RoleItem[]>('/roles')
}

export async function createRoleApi(payload: RolePayload) {
  return post<RoleItem>('/roles', payload)
}

export async function updateRoleApi(id: string, payload: Partial<RolePayload>) {
  return patch<RoleItem>(`/roles/${id}`, payload)
}

export async function assignRolePermissionsApi(id: string, permissionCodes: string[]) {
  return post<RoleItem>(`/roles/${id}/permissions`, { permissionCodes })
}

export async function getPermissionsApi() {
  return get<PermissionItem[]>('/permissions')
}
