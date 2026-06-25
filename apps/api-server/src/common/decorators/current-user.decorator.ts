import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { AuthRequest } from '../types/auth-request'

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<AuthRequest>()
  return request.user
})
