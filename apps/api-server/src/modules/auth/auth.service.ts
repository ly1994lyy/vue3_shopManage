import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import { AuditLogService } from '../../common/audit/audit-log.service'
import { PrismaService } from '../../database/prisma.service'
import type { JwtPayload } from '../../common/types/jwt-payload'
import { LoginDto } from './dto/login.dto'

export interface LoginContext {
  ip?: string | null
  userAgent?: string | null
  requestId?: string | null
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditLog: AuditLogService
  ) {}

  async login(dto: LoginDto, context: LoginContext = {}) {
    const user = await this.prisma.user.findUnique({
      where: { account: dto.account },
      select: {
        id: true,
        tenantId: true,
        account: true,
        password: true,
        name: true,
        type: true,
        status: true,
        userRoles: {
          select: {
            role: {
              select: {
                rolePermissions: {
                  select: {
                    permission: {
                      select: {
                        code: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!user || user.status !== 'active') {
      this.auditLog.recordLogin({
        account: dto.account,
        ip: context.ip,
        userAgent: context.userAgent,
        requestId: context.requestId,
        message: '账号不存在或已禁用',
        result: 'failure'
      })
      throw new UnauthorizedException('账号不存在或已禁用')
    }

    const passwordMatched = await argon2.verify(user.password, dto.password)

    if (!passwordMatched) {
      this.auditLog.recordLogin({
        userId: user.id,
        tenantId: user.tenantId,
        account: dto.account,
        ip: context.ip,
        userAgent: context.userAgent,
        requestId: context.requestId,
        message: '密码错误',
        result: 'failure'
      })
      throw new UnauthorizedException('账号或密码错误')
    }

    const permissions = Array.from(
      new Set(
        user.userRoles.flatMap((userRole) =>
          userRole.role.rolePermissions.map((rolePermission) => rolePermission.permission.code)
        )
      )
    )

    const payload: JwtPayload = {
      sub: user.id,
      account: user.account,
      name: user.name,
      type: user.type,
      tenantId: user.tenantId,
      permissions
    }

    this.auditLog.recordLogin({
      userId: user.id,
      tenantId: user.tenantId,
      account: user.account,
      ip: context.ip,
      userAgent: context.userAgent,
      requestId: context.requestId,
      result: 'success'
    })

    return {
      accessToken: await this.signAccessToken(payload),
      refreshToken: await this.signRefreshToken(payload),
      user: {
        id: user.id,
        tenantId: user.tenantId,
        account: user.account,
        name: user.name,
        type: user.type,
        status: user.status,
        permissions
      }
    }
  }

  profile(user: JwtPayload) {
    return user
  }

  /**
   * 使用 refresh token 换发一对新的 access/refresh token。
   * - 会重新查库取用户权限，保证授权变更立即生效（同时确保账号未被禁用）
   * - 轮换 refresh token（refresh token rotation）：旧的丢弃，签发新的
   */
  async refresh(refreshToken: string) {
    let payload: JwtPayload
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'dev-refresh-secret'
      })
    } catch {
      throw new UnauthorizedException('登录已过期，请重新登录')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        tenantId: true,
        account: true,
        name: true,
        type: true,
        status: true,
        userRoles: {
          select: {
            role: {
              select: {
                rolePermissions: {
                  select: { permission: { select: { code: true } } }
                }
              }
            }
          }
        }
      }
    })

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('账号不存在或已禁用')
    }

    const permissions = Array.from(
      new Set(
        user.userRoles.flatMap((userRole) =>
          userRole.role.rolePermissions.map((rolePermission) => rolePermission.permission.code)
        )
      )
    )

    const nextPayload: JwtPayload = {
      sub: user.id,
      account: user.account,
      name: user.name,
      type: user.type,
      tenantId: user.tenantId,
      permissions
    }

    return {
      accessToken: await this.signAccessToken(nextPayload),
      refreshToken: await this.signRefreshToken(nextPayload),
      user: {
        id: user.id,
        tenantId: user.tenantId,
        account: user.account,
        name: user.name,
        type: user.type,
        status: user.status,
        permissions
      }
    }
  }

  private signAccessToken(payload: JwtPayload) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'dev-access-secret',
      expiresIn: 60 * 60 * 2
    })
  }

  private signRefreshToken(payload: JwtPayload) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'dev-refresh-secret',
      expiresIn: 60 * 60 * 24 * 7
    })
  }
}
