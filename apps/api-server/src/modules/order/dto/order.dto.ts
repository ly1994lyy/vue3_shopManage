import {
  CreateOrderSchema,
  OrderStatusSchema,
  QueryOrdersSchema,
  ShipOrderSchema,
  UpdateOrderStatusSchema
} from '@shop-saas/schemas'
import { createZodDto } from 'nestjs-zod'

export { OrderStatusSchema as OrderStatusQuery }

export class QueryOrderDto extends createZodDto(QueryOrdersSchema) {}
export class CreateOrderDto extends createZodDto(CreateOrderSchema) {}
export class UpdateOrderStatusDto extends createZodDto(UpdateOrderStatusSchema) {}
export class ShipOrderDto extends createZodDto(ShipOrderSchema) {}
