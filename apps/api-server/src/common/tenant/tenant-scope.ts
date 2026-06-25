import { ForbiddenException } from '@nestjs/common'
import { UserType } from '@prisma/client'
import type { RequestUser } from '../types/request-user'

export function resolveTenantScope(user: RequestUser, requestedTenantId?: string | null) {
  if (user.type === UserType.platform) {
    return requestedTenantId || null
  }

  if (!user.tenantId) {
    throw new ForbiddenException('当前用户未绑定租户')
  }

  if (requestedTenantId && requestedTenantId !== user.tenantId) {
    throw new ForbiddenException('无权访问其他租户数据')
  }

  return user.tenantId
}

export function ensureSameTenant(user: RequestUser, resourceTenantId?: string | null) {
  if (user.type === UserType.platform) return

  if (!user.tenantId || resourceTenantId !== user.tenantId) {
    throw new ForbiddenException('无权访问该租户数据')
  }
}
