import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from '../../database/prisma.service'

/**
 * 日志清理服务：定期删除超过保留期的旧日志。
 *
 * 保留策略通过环境变量配置：
 *   - AUDIT_LOG_RETENTION_DAYS（默认 90）
 *   - LOGIN_LOG_RETENTION_DAYS（默认 90）
 *
 * 设为 0 或负数 → 关闭自动清理（适合开发环境）。
 *
 * 走 batched deleteMany，每批 1000，避免一次性扫表锁太久。
 */
@Injectable()
export class AuditLogCleanupService {
  private readonly logger = new Logger(AuditLogCleanupService.name)
  private readonly operationRetentionDays = this.parseRetention('AUDIT_LOG_RETENTION_DAYS', 90)
  private readonly loginRetentionDays = this.parseRetention('LOGIN_LOG_RETENTION_DAYS', 90)
  private readonly batchSize = 1000

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 每天凌晨 3 点（避开 2 点的租户过期 cron）扫一次。
   */
  @Cron('0 3 * * *', { timeZone: 'Asia/Shanghai' })
  async cleanupCron() {
    await this.cleanupOperationLogs()
    await this.cleanupLoginLogs()
  }

  /** 手动触发用，业务接口可以直接 await */
  async cleanupOperationLogs() {
    if (this.operationRetentionDays <= 0) {
      this.logger.log('Operation log cleanup disabled (retention <= 0)')
      return { deleted: 0, skipped: true }
    }

    const cutoff = new Date(Date.now() - this.operationRetentionDays * 24 * 60 * 60 * 1000)
    let totalDeleted = 0

    // 用 limit + 循环，避免一次 deleteMany 把整张表锁太久
    while (true) {
      // Prisma 没有 deleteMany + limit，所以先 findMany 拿 id 列表，再按 id 删
      const ids = await this.prisma.operationLog.findMany({
        where: { createdAt: { lt: cutoff } },
        select: { id: true },
        take: this.batchSize
      })
      if (!ids.length) break

      const result = await this.prisma.operationLog.deleteMany({
        where: { id: { in: ids.map((r) => r.id) } }
      })
      totalDeleted += result.count
      if (ids.length < this.batchSize) break
    }

    if (totalDeleted) {
      this.logger.log(
        `[cron] Cleaned up ${totalDeleted} operation logs older than ${cutoff.toISOString().slice(0, 10)}`
      )
    } else {
      this.logger.log(
        `[cron] No operation logs older than ${cutoff.toISOString().slice(0, 10)} to delete`
      )
    }

    return { deleted: totalDeleted, cutoff: cutoff.toISOString() }
  }

  async cleanupLoginLogs() {
    if (this.loginRetentionDays <= 0) {
      this.logger.log('Login log cleanup disabled (retention <= 0)')
      return { deleted: 0, skipped: true }
    }

    const cutoff = new Date(Date.now() - this.loginRetentionDays * 24 * 60 * 60 * 1000)
    let totalDeleted = 0

    while (true) {
      const ids = await this.prisma.loginLog.findMany({
        where: { createdAt: { lt: cutoff } },
        select: { id: true },
        take: this.batchSize
      })
      if (!ids.length) break

      const result = await this.prisma.loginLog.deleteMany({
        where: { id: { in: ids.map((r) => r.id) } }
      })
      totalDeleted += result.count
      if (ids.length < this.batchSize) break
    }

    if (totalDeleted) {
      this.logger.log(
        `[cron] Cleaned up ${totalDeleted} login logs older than ${cutoff.toISOString().slice(0, 10)}`
      )
    } else {
      this.logger.log(
        `[cron] No login logs older than ${cutoff.toISOString().slice(0, 10)} to delete`
      )
    }

    return { deleted: totalDeleted, cutoff: cutoff.toISOString() }
  }

  private parseRetention(envKey: string, fallback: number): number {
    const raw = process.env[envKey]
    if (!raw) return fallback
    const n = Number(raw)
    return Number.isFinite(n) ? n : fallback
  }
}
