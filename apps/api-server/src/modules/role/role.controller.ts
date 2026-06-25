import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuditLog } from '../../common/audit/audit-log.decorator'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import { AssignRolePermissionsDto, CreateRoleDto, UpdateRoleDto } from './dto/role.dto'
import { RoleService } from './role.service'

@ApiTags('role')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @RequirePermissions('role:list:view')
  @ApiOperation({ summary: '角色列表' })
  findMany() {
    return this.roleService.findMany()
  }

  @Get(':id')
  @RequirePermissions('role:list:view')
  @ApiOperation({ summary: '角色详情' })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id)
  }

  @Post()
  @RequirePermissions('role:create:submit')
  @AuditLog({ module: 'role', action: 'create', description: '创建角色' })
  @ApiOperation({ summary: '创建角色' })
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto)
  }

  @Patch(':id')
  @RequirePermissions('role:update:submit')
  @AuditLog({ module: 'role', action: 'update', description: '更新角色' })
  @ApiOperation({ summary: '更新角色' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto)
  }

  @Post(':id/permissions')
  @RequirePermissions('role:permission:assign')
  @AuditLog({ module: 'role', action: 'assign-permissions', description: '分配角色权限' })
  @ApiOperation({ summary: '分配角色权限' })
  assignPermissions(@Param('id') id: string, @Body() dto: AssignRolePermissionsDto) {
    return this.roleService.assignPermissions(id, dto)
  }
}
