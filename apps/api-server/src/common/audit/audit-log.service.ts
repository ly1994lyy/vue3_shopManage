import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

export interface OperationLogInput {
  tenantId?: string | null
  userId?: string | null
  account?: string | null
  module: string
  action: string
  targetId?: string | null
  method?: string | null
  path?: string | null
  ip?: string | null
  userAgent?: string | null
  payload?: unknown
  message?: string | null
  result: 'success' | 'failure'
  durationMs?: number | null
  requestId?: string | null
}

export interface LoginLogInput {
  tenantId?: string | null
  userId?: string | null
  account: string
  ip?: string | null
  userAgent?: string | null
  message?: string | null
  result: 'success' | 'failure'
  requestId?: string | null
}

/**
 * 操作日志/登录日志写入服务。
 * 所有方法都是 fire-and-forget —— 永远不抛错，落库失败只在应用日志里告警。
 */
@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name)

  constructor(private readonly prisma: PrismaService) {}

  recordOperation(input: OperationLogInput): void {
    const payloadStr = this.serializePayload(input.payload)

    this.prisma.operationLog
      .create({
        data: {
          tenantId: input.tenantId ?? null,
          userId: input.userId ?? null,
          account: input.account ?? null,
          module: input.module,
          action: input.action,
          targetId: input.targetId ?? null,
          method: input.method ?? null,
          path: this.truncate(input.path, 255),
          ip: input.ip ?? null,
          userAgent: this.truncate(input.userAgent, 500),
          payload: payloadStr,
          message: this.truncate(input.message, 500),
          result: input.result,
          durationMs: input.durationMs ?? null,
          requestId: input.requestId ?? null
        }
      })
      .catch((err) => {
        this.logger.error(`Failed to write operation log: ${(err as Error).message}`, err)
      })
  }

  recordLogin(input: LoginLogInput): void {
    this.prisma.loginLog
      .create({
        data: {
          tenantId: input.tenantId ?? null,
          userId: input.userId ?? null,
          account: input.account,
          ip: input.ip ?? null,
          userAgent: this.truncate(input.userAgent, 500),
          message: this.truncate(input.message, 500),
          result: input.result,
          requestId: input.requestId ?? null
        }
      })
      .catch((err) => {
        this.logger.error(`Failed to write login log: ${(err as Error).message}`, err)
      })
  }

  /**
   * 把请求 payload 序列化成简短 JSON。
   * - 屏蔽 password / token / secret 等敏感字段
   * - 截断为 2KB 以防超大对象拖垮数据库
   */
  private serializePayload(payload: unknown): string | null {
    if (payload == null) return null
    try {
      const cleaned = this.maskSensitive(payload)
      const str = JSON.stringify(cleaned)
      return str.length > 2000 ? `${str.slice(0, 2000)}...` : str
    } catch {
      return null
    }
  }

  private maskSensitive(value: unknown, depth = 0): unknown {
    if (depth > 4 || value == null) return value
    if (Array.isArray(value)) return value.map((v) => this.maskSensitive(v, depth + 1))
    if (typeof value === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(value)) {
        if (/password|token|secret|authorization|cookie/i.test(k)) {
          out[k] = '***'
        } else {
          out[k] = this.maskSensitive(v, depth + 1)
        }
      }
      return out
    }
    return value
  }

  private truncate(value: string | null | undefined, max: number): string | null {
    if (!value) return null
    return value.length > max ? value.slice(0, max) : value
  }
}
