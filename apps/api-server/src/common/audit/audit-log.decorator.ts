import { SetMetadata } from '@nestjs/common'

export interface AuditLogMeta {
  /** 业务模块名，如 "tenant" / "product" */
  module: string
  /** 操作动作，如 "create" / "update" / "delete" / "renew" */
  action: string
  /** 操作描述（可选），如 "创建租户" */
  description?: string
}

export const AUDIT_LOG_META = 'audit_log_meta'

/**
 * 标记此路由需要写入操作日志。
 * 拦截器会在响应成功后异步落库，不阻塞主流程。
 *
 * @example
 *   @AuditLog({ module: 'tenant', action: 'create', description: '创建租户' })
 *   create(@Body() dto: CreateTenantDto) { ... }
 */
export const AuditLog = (meta: AuditLogMeta) => SetMetadata(AUDIT_LOG_META, meta)
