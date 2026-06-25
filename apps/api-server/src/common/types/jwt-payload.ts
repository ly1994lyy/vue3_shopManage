export interface JwtPayload {
  sub: string
  account: string
  name?: string
  type: string
  tenantId: string | null
  permissions: string[]
}
