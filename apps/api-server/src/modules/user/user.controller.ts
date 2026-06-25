import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuditLog } from '../../common/audit/audit-log.decorator'
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import type { RequestUser } from '../../common/types/request-user'
import { CreateUserDto } from './dto/create-user.dto'
import { AssignUserRolesDto, QueryUserDto, ResetUserPasswordDto, UpdateUserDto } from './dto/user.dto'
import { UserService } from './user.service'

@ApiTags('user')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RequirePermissions('user:list:view')
  @ApiOperation({ summary: '用户列表' })
  findMany(@Query() query: QueryUserDto, @CurrentUser() user: RequestUser, @CurrentTenantId() tenantId: string | null) {
    return this.userService.findMany(query, user, tenantId)
  }

  @Get(':id')
  @RequirePermissions('user:list:view')
  @ApiOperation({ summary: '用户详情' })
  findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.userService.findOne(id, user)
  }

  @Post()
  @RequirePermissions('user:create:submit')
  @AuditLog({ module: 'user', action: 'create', description: '创建用户' })
  @ApiOperation({ summary: '创建用户' })
  create(@Body() dto: CreateUserDto, @CurrentUser() user: RequestUser, @CurrentTenantId() tenantId: string | null) {
    return this.userService.create(dto, user, tenantId)
  }

  @Patch(':id')
  @RequirePermissions('user:update:submit')
  @AuditLog({ module: 'user', action: 'update', description: '更新用户' })
  @ApiOperation({ summary: '更新用户' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: RequestUser) {
    return this.userService.update(id, dto, user)
  }

  @Post(':id/roles')
  @RequirePermissions('user:role:assign')
  @AuditLog({ module: 'user', action: 'assign-roles', description: '分配用户角色' })
  @ApiOperation({ summary: '分配用户角色' })
  assignRoles(@Param('id') id: string, @Body() dto: AssignUserRolesDto, @CurrentUser() user: RequestUser) {
    return this.userService.assignRoles(id, dto, user)
  }

  @Post(':id/password')
  @RequirePermissions('user:password:reset')
  @AuditLog({ module: 'user', action: 'reset-password', description: '重置用户密码' })
  @ApiOperation({ summary: '重置用户密码' })
  resetPassword(@Param('id') id: string, @Body() dto: ResetUserPasswordDto, @CurrentUser() user: RequestUser) {
    return this.userService.resetPassword(id, dto, user)
  }
}
