import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import { catchError, tap, type Observable, throwError } from 'rxjs'
import { REQUEST_ID_HEADER } from '../middleware/request-id.middleware'
import type { RequestUser } from '../types/request-user'
import { AUDIT_LOG_META, type AuditLogMeta } from './audit-log.decorator'
import { AuditLogService } from './audit-log.service'

interface RequestWithUser extends Request {
  user?: RequestUser
}

/**
 * 全局拦截器：检查目标 handler 是否有 @AuditLog() 装饰，有则在响应完成后写一条操作日志。
 * 写入完全异步、不阻塞主链路；失败只打应用日志。
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name)

  constructor(
    private readonly reflector: Reflector,
    private readonly auditLog: AuditLogService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.getAllAndOverride<AuditLogMeta | undefined>(AUDIT_LOG_META, [
      context.getHandler(),
      context.getClass()
    ])

    if (!meta) {
      return next.handle()
    }

    const startedAt = Date.now()
    const req = context.switchToHttp().getRequest<RequestWithUser>()
    const requestId = req.headers[REQUEST_ID_HEADER]?.toString()
    const ip = this.resolveIp(req)
    const userAgent = req.headers['user-agent']?.toString()
    const user = req.user
    // 资源 id —— 路径里的 :id；如果没有就退到响应里的 id 字段
    const rawParamId = req.params?.id
    const paramId = typeof rawParamId === 'string' ? rawParamId : null

    const payload = this.shallowPayload(req)

    return next.handle().pipe(
      tap((response) => {
        const targetId =
          paramId ??
          (response && typeof response === 'object' && 'id' in response
            ? String((response as { id: unknown }).id)
            : null)

        this.auditLog.recordOperation({
          tenantId: user?.tenantId ?? null,
          userId: user?.id ?? null,
          account: user?.account ?? null,
          module: meta.module,
          action: meta.action,
          targetId,
          method: req.method,
          path: req.originalUrl || req.url,
          ip,
          userAgent,
          payload,
          message: meta.description ?? null,
          result: 'success',
          durationMs: Date.now() - startedAt,
          requestId
        })
      }),
      catchError((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err)

        // 5xx 异常这里先 warn 一下，HttpExceptionFilter 会再打完整 stack
        this.logger.warn(`[${requestId ?? '-'}] ${meta.module}.${meta.action} failed: ${message}`)

        this.auditLog.recordOperation({
          tenantId: user?.tenantId ?? null,
          userId: user?.id ?? null,
          account: user?.account ?? null,
          module: meta.module,
          action: meta.action,
          targetId: paramId,
          method: req.method,
          path: req.originalUrl || req.url,
          ip,
          userAgent,
          payload,
          message,
          result: 'failure',
          durationMs: Date.now() - startedAt,
          requestId
        })

        return throwError(() => err)
      })
    )
  }

  private resolveIp(req: Request): string | null {
    const forwarded = req.headers['x-forwarded-for']
    if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0]?.trim() || null
    return req.ip || req.socket.remoteAddress || null
  }

  private shallowPayload(req: Request) {
    const result: Record<string, unknown> = {}
    if (req.query && Object.keys(req.query).length) result.query = req.query
    if (req.body && Object.keys(req.body as object).length) result.body = req.body
    if (req.params && Object.keys(req.params).length) result.params = req.params
    return Object.keys(result).length ? result : null
  }
}
