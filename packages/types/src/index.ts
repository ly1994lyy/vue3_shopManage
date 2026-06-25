export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  requestId: string
}

export interface PageResult<T> {
  list: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

export interface UserProfile {
  id: string
  name: string
  account: string
  type: 'platform' | 'tenant' | 'customer'
  status?: 'active' | 'disabled'
  tenantId: string | null
  permissions: string[]
}

export interface LoginResult {
  accessToken: string
  refreshToken: string
  user: UserProfile
}

export interface TenantSummary {
  id: string
  name: string
  code?: string
  status: 'pending' | 'active' | 'disabled' | 'expired'
  contact?: string | null
  phone?: string | null
  email?: string | null
  plan: 'starter' | 'standard' | 'pro' | 'enterprise'
  expiredAt?: string | null
  /** 剩余天数：null = 永不过期；正数 = 剩余；负数 = 已过期 N 天 */
  daysRemaining?: number | null
  isExpired?: boolean
  createdAt?: string
  updatedAt?: string
}
