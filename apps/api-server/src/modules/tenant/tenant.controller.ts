import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuditLog } from '../../common/audit/audit-log.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import type { RequestUser } from '../../common/types/request-user'
import { CreateTenantDto, InitTenantAdminDto } from './dto/create-tenant.dto'
import { QueryTenantDto } from './dto/query-tenant.dto'
import { RenewTenantDto, UpdateTenantDto } from './dto/update-tenant.dto'
import { TenantService } from './tenant.service'

@ApiTags('tenant')
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  @RequirePermissions('tenant:list:view')
  @ApiOperation({ summary: '租户列表' })
  findMany(@Query() query: QueryTenantDto, @CurrentUser() user: RequestUser) {
    return this.tenantService.findMany(query, user)
  }

  @Get('expiring')
  @RequirePermissions('tenant:list:view')
  @ApiOperation({ summary: '即将到期的租户（默认 30 天内）' })
  findExpiring(
    @Query('withinDays') withinDays: string | undefined,
    @Query('limit') limit: string | undefined,
    @CurrentUser() user: RequestUser
  ) {
    const within = Number(withinDays) || 30
    const lim = Number(limit) || 10
    return this.tenantService.findExpiring(user, within, lim)
  }

  @Get(':id')
  @RequirePermissions('tenant:list:view')
  @ApiOperation({ summary: '租户详情' })
  findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.tenantService.findOne(id, user)
  }

  @Post()
  @RequirePermissions('tenant:create:submit')
  @AuditLog({ module: 'tenant', action: 'create', description: '创建租户' })
  @ApiOperation({ summary: '创建租户' })
  create(@Body() dto: CreateTenantDto) {
    return this.tenantService.create(dto)
  }

  @Patch(':id')
  @RequirePermissions('tenant:update:submit')
  @AuditLog({ module: 'tenant', action: 'update', description: '更新租户' })
  @ApiOperation({ summary: '更新租户' })
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto, @CurrentUser() user: RequestUser) {
    return this.tenantService.update(id, dto, user)
  }

  @Post(':id/renew')
  @RequirePermissions('tenant:update:submit')
  @AuditLog({ module: 'tenant', action: 'renew', description: '租户续期' })
  @ApiOperation({ summary: '租户续期' })
  renew(@Param('id') id: string, @Body() dto: RenewTenantDto, @CurrentUser() user: RequestUser) {
    return this.tenantService.renew(id, dto, user)
  }

  @Post(':id/admin')
  @RequirePermissions('tenant:admin:init')
  @AuditLog({ module: 'tenant', action: 'init-admin', description: '初始化租户管理员' })
  @ApiOperation({ summary: '初始化租户管理员' })
  initAdmin(@Param('id') id: string, @Body() dto: InitTenantAdminDto, @CurrentUser() user: RequestUser) {
    return this.tenantService.initAdmin(id, dto, user)
  }

  @Delete(':id')
  @RequirePermissions('tenant:delete:submit')
  @AuditLog({ module: 'tenant', action: 'delete', description: '删除租户' })
  @ApiOperation({ summary: '删除租户' })
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.tenantService.remove(id, user)
  }
}
