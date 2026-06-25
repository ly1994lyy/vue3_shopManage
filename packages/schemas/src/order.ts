import { z } from 'zod'
import { PaginationQuerySchema } from './common'

/**
 * 订单状态枚举
 */
export const OrderStatusSchema = z.enum(['pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded'])
export type OrderStatus = z.infer<typeof OrderStatusSchema>

/**
 * 查询订单列表 Schema
 */
export const QueryOrdersSchema = PaginationQuerySchema.extend({
  orderNo: z.string().optional(),
  status: OrderStatusSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
}).strict()
export type QueryOrdersInput = z.infer<typeof QueryOrdersSchema>

/**
 * 创建订单商品项 Schema
 */
export const CreateOrderItemSchema = z
  .object({
    productId: z.string().min(1, '商品 ID 不能为空'),
    skuId: z.string().optional(),
    quantity: z.coerce.number().int().min(1, '商品数量至少为 1')
  })
  .strict()
export type CreateOrderItemInput = z.infer<typeof CreateOrderItemSchema>

/**
 * 创建订单 Schema
 */
export const CreateOrderSchema = z
  .object({
    items: z.array(CreateOrderItemSchema).min(1, '订单至少包含一个商品'),
    receiverName: z.string().min(2, '收货人姓名至少 2 个字符'),
    receiverPhone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
    receiverAddress: z.string().min(5, '收货地址至少 5 个字符'),
    shippingFee: z.coerce.number().min(0).optional(),
    discount: z.coerce.number().min(0).optional(),
    remark: z.string().optional()
  })
  .strict()
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>

/**
 * 更新订单状态 Schema
 */
export const UpdateOrderStatusSchema = z
  .object({
    status: OrderStatusSchema,
    remark: z.string().optional()
  })
  .strict()
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>

/**
 * 订单发货 Schema
 */
export const ShipOrderSchema = z
  .object({
    company: z.string().min(1, '快递公司不能为空'),
    trackingNo: z.string().min(1, '快递单号不能为空')
  })
  .strict()
export type ShipOrderInput = z.infer<typeof ShipOrderSchema>
