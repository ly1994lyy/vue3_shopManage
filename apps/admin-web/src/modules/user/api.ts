import { get, patch, post } from '@shop-saas/api-client'
import type { PageResult } from '@shop-saas/types'

export interface UserItem {
  id: string
  tenantId: string | null
  account: string
  name: string
  email?: string | null
  phone?: string | null
  type: 'platform' | 'tenant' | 'customer'
  status: 'active' | 'disabled'
  createdAt: string
  updatedAt: string
  userRoles?: Array<{
    role: {
      id: string
      name: string
      code: string
      scope: 'platform' | 'tenant'
      tenantId?: string | null
    }
  }>
}

export interface QueryUsersParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: 'active' | 'disabled'
}

export interface CreateUserPayload {
  account: string
  password: string
  name: string
  tenantId?: string
  email?: string
  type?: 'platform' | 'tenant' | 'customer'
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  status?: 'active' | 'disabled'
}

export function getUsersApi(params: QueryUsersParams) {
  return get<PageResult<UserItem>>('/users', params)
}

export function createUserApi(payload: CreateUserPayload) {
  return post<UserItem>('/users', payload)
}

export function updateUserApi(id: string, payload: UpdateUserPayload) {
  return patch<UserItem>(`/users/${id}`, payload)
}

export function assignUserRolesApi(id: string, roleIds: string[]) {
  return post<UserItem>(`/users/${id}/roles`, { roleIds })
}

export function resetUserPasswordApi(id: string, password: string) {
  return post<{ success: boolean }>(`/users/${id}/password`, { password })
}
