import { get, patch, post } from '@shop-saas/api-client'
import type { PageResult, TenantSummary } from '@shop-saas/types'

export type TenantStatus = 'pending' | 'active' | 'disabled' | 'expired'
export type TenantPlan = 'starter' | 'standard' | 'pro' | 'enterprise'

export interface QueryTenantsParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: TenantStatus
  plan?: TenantPlan
  sortBy?: 'expiredAt' | 'createdAt' | 'name'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateTenantPayload {
  name: string
  code: string
  contact?: string
  phone?: string
  email?: string
  status?: TenantStatus
  plan?: TenantPlan
  /** ISO 字符串或 null（null = 永不过期） */
  expiredAt?: string | null
}

export interface UpdateTenantPayload {
  name?: string
  contact?: string
  phone?: string
  email?: string
  status?: TenantStatus
  plan?: TenantPlan
  expiredAt?: string | null
}

export interface RenewTenantPayload {
  months: number
  plan?: TenantPlan
}

export interface InitTenantAdminPayload {
  account: string
  password: string
  name: string
  email?: string
}

export function getTenantsApi(params: QueryTenantsParams) {
  return get<PageResult<TenantSummary>>('/tenants', params)
}

export function getExpiringTenantsApi(options?: { withinDays?: number; limit?: number }) {
  return get<{ withinDays: number; list: TenantSummary[] }>('/tenants/expiring', options || {})
}

export function createTenantApi(payload: CreateTenantPayload) {
  return post<TenantSummary>('/tenants', payload)
}

export function updateTenantApi(id: string, payload: UpdateTenantPayload) {
  return patch<TenantSummary>(`/tenants/${id}`, payload)
}

export function renewTenantApi(id: string, payload: RenewTenantPayload) {
  return post<TenantSummary>(`/tenants/${id}/renew`, payload)
}

export function initTenantAdminApi(id: string, payload: InitTenantAdminPayload) {
  return post(`/tenants/${id}/admin`, payload)
}

export function getTenantOptionsApi() {
  return getTenantsApi({ page: 1, pageSize: 100, status: 'active' })
}
