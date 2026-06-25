import { Controller, Get, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuditLog } from '../../common/audit/audit-log.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import type { RequestUser } from '../../common/types/request-user'
import { AuditLogCleanupService } from './audit-log-cleanup.service'
import { AuditLogQueryService } from './audit-log-query.service'
import { QueryLoginLogsDto, QueryOperationLogsDto } from './dto/audit-log.dto'

@ApiTags('audit-log')
@Controller('audit-logs')
export class AuditLogController {
  constructor(
    private readonly service: AuditLogQueryService,
    private readonly cleanup: AuditLogCleanupService
  ) {}

  @Get('operations')
  @RequirePermissions('audit:operation:view')
  @ApiOperation({ summary: '操作日志列表' })
  findOperations(@Query() query: QueryOperationLogsDto, @CurrentUser() user: RequestUser) {
    return this.service.findOperationLogs(query, user)
  }

  @Get('operations/stats')
  @RequirePermissions('audit:operation:view')
  @ApiOperation({ summary: '操作日志统计' })
  findOperationStats(@CurrentUser() user: RequestUser) {
    return this.service.findOperationStats(user)
  }

  @Get('logins')
  @RequirePermissions('audit:login:view')
  @ApiOperation({ summary: '登录日志列表' })
  findLogins(@Query() query: QueryLoginLogsDto, @CurrentUser() user: RequestUser) {
    return this.service.findLoginLogs(query, user)
  }

  @Post('cleanup')
  @RequirePermissions('audit:cleanup:submit')
  @AuditLog({ module: 'audit', action: 'cleanup', description: '手动清理过期日志' })
  @ApiOperation({ summary: '手动触发日志清理（仅供调试使用）' })
  async cleanupNow() {
    const [operation, login] = await Promise.all([
      this.cleanup.cleanupOperationLogs(),
      this.cleanup.cleanupLoginLogs()
    ])
    return { operation, login }
  }
}
