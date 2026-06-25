import { get, patch, post } from '@shop-saas/api-client'
import type { PageResult } from '@shop-saas/types'

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'refunded'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunding' | 'refunded'
export type ShippingStatus = 'unshipped' | 'shipped' | 'delivered'

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  productCode: string
  skuName?: string | null
  cover?: string | null
  quantity: number
  price: string | number
  subtotal: string | number
}

export interface Order {
  id: string
  orderNo: string
  tenantId: string
  userId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  shippingStatus: ShippingStatus
  subtotal: string | number
  shippingFee: string | number
  discount: string | number
  totalAmount: string | number
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  paidAt?: string | null
  shippedAt?: string | null
  completedAt?: string | null
  cancelledAt?: string | null
  remark?: string | null
  createdAt: string
  updatedAt: string
  items?: OrderItem[]
  user?: {
    id: string
    account: string
    name: string
  }
}

export interface QueryOrdersParams {
  page?: number
  pageSize?: number
  orderNo?: string
  status?: OrderStatus
  startDate?: string
  endDate?: string
}

export interface CreateOrderItem {
  productId: string
  skuId?: string
  quantity: number
}

export interface CreateOrderPayload {
  items: CreateOrderItem[]
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  shippingFee?: number
  discount?: number
  remark?: string
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus
  remark?: string
}

export interface ShipOrderPayload {
  company: string
  trackingNo: string
}

export function getOrdersApi(params: QueryOrdersParams) {
  return get<PageResult<Order>>('/orders', params)
}

export function getOrderDetailApi(id: string) {
  return get<Order>(`/orders/${id}`)
}

export function createOrderApi(payload: CreateOrderPayload) {
  return post<Order>('/orders', payload)
}

export function updateOrderStatusApi(id: string, payload: UpdateOrderStatusPayload) {
  return patch<Order>(`/orders/${id}/status`, payload)
}

export function shipOrderApi(id: string, payload: ShipOrderPayload) {
  return post<Order>(`/orders/${id}/ship`, payload)
}

export function cancelOrderApi(id: string) {
  return post<Order>(`/orders/${id}/cancel`)
}
