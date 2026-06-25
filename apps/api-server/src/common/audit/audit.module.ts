import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { AuditLogService } from './audit-log.service'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [AuditLogService],
  exports: [AuditLogService]
})
export class AuditModule {}
