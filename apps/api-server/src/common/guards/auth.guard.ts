import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { TokenExpiredError } from '@nestjs/jwt'
import type { Request } from 'express'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import type { JwtPayload } from '../types/jwt-payload'
import type { RequestUser } from '../types/request-user'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request & { user?: RequestUser }>()
    const token = this.extractToken(request)

    if (!token) {
      throw new UnauthorizedException('未登录，请先登录')
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'dev-access-secret'
      })

      request.user = {
        id: payload.sub,
        account: payload.account,
        name: payload.name,
        type: payload.type as RequestUser['type'],
        tenantId: payload.tenantId,
        permissions: payload.permissions || []
      }

      return true
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('登录已过期，请重新登录')
      }
      // JsonWebTokenError / SyntaxError / 其它解析失败 → 一律视为非法 token
      throw new UnauthorizedException('登录凭证无效，请重新登录')
    }
  }

  private extractToken(request: Request) {
    const authorization = request.headers.authorization

    if (!authorization) return ''

    const [type, token] = authorization.split(' ')
    return type === 'Bearer' ? token : ''
  }
}
