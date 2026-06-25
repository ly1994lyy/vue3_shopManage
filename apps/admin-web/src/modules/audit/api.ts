import { get, post } from '@shop-saas/api-client'
import type { PageResult } from '@shop-saas/types'

export interface OperationLogItem {
  id: string
  tenantId: string | null
  userId: string | null
  account: string | null
  module: string
  action: string
  targetId: string | null
  method: string | null
  path: string | null
  ip: string | null
  userAgent: string | null
  payload: string | null
  message: string | null
  result: 'success' | 'failure'
  durationMs: number | null
  requestId: string | null
  createdAt: string
}

export interface LoginLogItem {
  id: string
  tenantId: string | null
  userId: string | null
  account: string
  ip: string | null
  userAgent: string | null
  message: string | null
  result: 'success' | 'failure'
  requestId: string | null
  createdAt: string
}

export interface OperationLogStats {
  total: number
  failures: number
  last24h: number
}

export interface QueryOperationLogsParams {
  page?: number
  pageSize?: number
  module?: string
  action?: string
  result?: 'success' | 'failure'
  account?: string
  startDate?: string
  endDate?: string
  keyword?: string
}

export interface QueryLoginLogsParams {
  page?: number
  pageSize?: number
  account?: string
  result?: 'success' | 'failure'
  startDate?: string
  endDate?: string
}

export function getOperationLogsApi(params: QueryOperationLogsParams) {
  return get<PageResult<OperationLogItem>>('/audit-logs/operations', params)
}

export function getOperationLogStatsApi() {
  return get<OperationLogStats>('/audit-logs/operations/stats')
}

export function getLoginLogsApi(params: QueryLoginLogsParams) {
  return get<PageResult<LoginLogItem>>('/audit-logs/logins', params)
}

export interface CleanupResult {
  operation: { deleted: number; skipped?: boolean; cutoff?: string }
  login: { deleted: number; skipped?: boolean; cutoff?: string }
}

export function cleanupAuditLogsApi() {
  return post<CleanupResult>('/audit-logs/cleanup')
}
