import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import { PermissionService } from './permission.service'

@ApiTags('permission')
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @RequirePermissions('permission:list:view')
  @ApiOperation({ summary: '权限列表' })
  findMany() {
    return this.permissionService.findMany()
  }
}
