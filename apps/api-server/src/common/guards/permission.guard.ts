import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator'
import type { AuthRequest } from '../types/auth-request'

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])

    if (isPublic) {
      return true
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (!requiredPermissions?.length) {
      return true
    }

    const request = context.switchToHttp().getRequest<AuthRequest>()
    const userPermissions = request.user?.permissions || []
    const allowed = requiredPermissions.every((permission) => userPermissions.includes(permission))

    if (!allowed) {
      throw new ForbiddenException('无访问权限')
    }

    return true
  }
}
