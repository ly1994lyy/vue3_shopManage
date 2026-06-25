import { UserType } from '@prisma/client'

export interface RequestUser {
  id: string
  account: string
  name?: string
  type: UserType
  tenantId: string | null
  permissions: string[]
}
