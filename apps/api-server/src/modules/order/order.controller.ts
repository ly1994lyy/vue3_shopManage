import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuditLog } from '../../common/audit/audit-log.decorator'
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import type { RequestUser } from '../../common/types/request-user'
import { CreateOrderDto, QueryOrderDto, ShipOrderDto, UpdateOrderStatusDto } from './dto/order.dto'
import { OrderService } from './order.service'

@ApiTags('order')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @RequirePermissions('order:list:view')
  @ApiOperation({ summary: '订单列表' })
  findMany(@Query() query: QueryOrderDto, @CurrentUser() user: RequestUser, @CurrentTenantId() tenantId: string | null) {
    return this.orderService.findMany(query, user, tenantId)
  }

  @Get(':id')
  @RequirePermissions('order:list:view')
  @ApiOperation({ summary: '订单详情' })
  findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.orderService.findOne(id, user)
  }

  @Post()
  @RequirePermissions('order:create:submit')
  @AuditLog({ module: 'order', action: 'create', description: '创建订单' })
  @ApiOperation({ summary: '创建订单' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: RequestUser, @CurrentTenantId() tenantId: string | null) {
    return this.orderService.create(dto, user, tenantId)
  }

  @Patch(':id/status')
  @RequirePermissions('order:update:submit')
  @AuditLog({ module: 'order', action: 'update-status', description: '更新订单状态' })
  @ApiOperation({ summary: '更新订单状态' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto, @CurrentUser() user: RequestUser) {
    return this.orderService.updateStatus(id, dto, user)
  }

  @Post(':id/ship')
  @RequirePermissions('order:ship:submit')
  @AuditLog({ module: 'order', action: 'ship', description: '订单发货' })
  @ApiOperation({ summary: '订单发货' })
  shipOrder(@Param('id') id: string, @Body() dto: ShipOrderDto, @CurrentUser() user: RequestUser) {
    return this.orderService.shipOrder(id, dto, user)
  }

  @Post(':id/cancel')
  @RequirePermissions('order:cancel:submit')
  @AuditLog({ module: 'order', action: 'cancel', description: '取消订单' })
  @ApiOperation({ summary: '取消订单' })
  cancelOrder(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.orderService.cancelOrder(id, user)
  }
}
