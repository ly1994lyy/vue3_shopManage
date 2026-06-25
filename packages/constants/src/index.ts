export enum TenantStatus {
  Pending = 'pending',
  Active = 'active',
  Disabled = 'disabled',
  Expired = 'expired'
}

export enum UserRole {
  PlatformSuperAdmin = 'platform_super_admin',
  TenantAdmin = 'tenant_admin',
  Operator = 'operator'
}

export const API_SUCCESS_CODE = 0
