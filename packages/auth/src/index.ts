const TOKEN_KEY = 'shop-saas-token'
const REFRESH_TOKEN_KEY = 'shop-saas-refresh-token'
const TENANT_CONTEXT_KEY = 'shop-saas-tenant-context'

export function getAccessToken() {
  return typeof localStorage === 'undefined' ? '' : localStorage.getItem(TOKEN_KEY) || ''
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getRefreshToken() {
  return typeof localStorage === 'undefined' ? '' : localStorage.getItem(REFRESH_TOKEN_KEY) || ''
}

export function setRefreshToken(token: string) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(TENANT_CONTEXT_KEY)
}

export function clearAccessToken() {
  clearTokens()
}

export function getTenantContext() {
  return typeof localStorage === 'undefined' ? '' : localStorage.getItem(TENANT_CONTEXT_KEY) || ''
}

export function setTenantContext(tenantId: string) {
  if (tenantId) {
    localStorage.setItem(TENANT_CONTEXT_KEY, tenantId)
  } else {
    localStorage.removeItem(TENANT_CONTEXT_KEY)
  }
}

export function clearTenantContext() {
  localStorage.removeItem(TENANT_CONTEXT_KEY)
}

export function hasPermission(userPermissions: string[], permission: string) {
  return userPermissions.includes(permission)
}
