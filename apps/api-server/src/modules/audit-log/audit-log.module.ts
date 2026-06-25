import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { AuditLogCleanupService } from './audit-log-cleanup.service'
import { AuditLogQueryService } from './audit-log-query.service'
import { AuditLogController } from './audit-log.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [AuditLogController],
  providers: [AuditLogQueryService, AuditLogCleanupService]
})
export class AuditLogModule {}
