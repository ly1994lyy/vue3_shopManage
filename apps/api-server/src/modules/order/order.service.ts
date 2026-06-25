import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { OrderStatus, PaymentStatus, Prisma, ShippingStatus } from '@prisma/client'
import { ensureSameTenant, resolveTenantScope } from '../../common/tenant/tenant-scope'
import type { RequestUser } from '../../common/types/request-user'
import { PrismaService } from '../../database/prisma.service'
import { CreateOrderDto, QueryOrderDto, ShipOrderDto, UpdateOrderStatusDto } from './dto/order.dto'

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: QueryOrderDto, user: RequestUser, requestedTenantId?: string | null) {
    const tenantId = resolveTenantScope(user, requestedTenantId)
    const where: Prisma.OrderWhereInput = {
      ...(tenantId ? { tenantId } : {}),
      ...(query.orderNo ? { orderNo: { contains: query.orderNo } } : {}),
      ...(query.status ? { status: query.status as OrderStatus } : {}),
      ...(query.startDate || query.endDate
        ? {
            createdAt: {
              ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
              ...(query.endDate ? { lte: new Date(query.endDate) } : {})
            }
          }
        : {})
    }

    const [list, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  code: true,
                  cover: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              account: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      this.prisma.order.count({ where })
    ])

    return {
      list,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total
      }
    }
  }

  async findOne(id: string, user: RequestUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                code: true,
                cover: true,
                price: true
              }
            }
          }
        },
        payments: true,
        deliveries: true,
        user: {
          select: {
            id: true,
            account: true,
            name: true,
            phone: true
          }
        }
      }
    })

    if (!order) {
      throw new NotFoundException('订单不存在')
    }

    ensureSameTenant(user, order.tenantId)

    return order
  }

  async create(dto: CreateOrderDto, user: RequestUser, requestedTenantId?: string | null) {
    const tenantId = resolveTenantScope(user, requestedTenantId)

    if (!tenantId) {
      throw new BadRequestException('请先选择租户')
    }

    // 验证商品并计算金额
    const productIds = dto.items.map((item) => item.productId)
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        tenantId,
        status: 'on_sale'
      }
    })

    if (products.length !== productIds.length) {
      throw new BadRequestException('部分商品不存在或已下架')
    }

    // 计算金额
    let subtotal = 0
    const orderItems = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)

      if (!product) {
        throw new BadRequestException(`商品 ${item.productId} 不存在`)
      }

      const price = Number(product.price)
      const itemSubtotal = price * item.quantity
      subtotal += itemSubtotal

      return {
        productId: item.productId,
        skuId: item.skuId,
        productName: product.name,
        productCode: product.code,
        cover: product.cover,
        quantity: item.quantity,
        price,
        subtotal: itemSubtotal
      }
    })

    const shippingFee = dto.shippingFee ?? 0
    const discount = dto.discount ?? 0
    const totalAmount = subtotal + shippingFee - discount

    // 生成订单号
    const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // 创建订单
    const order = await this.prisma.order.create({
      data: {
        orderNo,
        tenantId,
        userId: user.id,
        receiverName: dto.receiverName,
        receiverPhone: dto.receiverPhone,
        receiverAddress: dto.receiverAddress,
        subtotal,
        shippingFee,
        discount,
        totalAmount,
        remark: dto.remark,
        items: {
          create: orderItems
        }
      },
      include: {
        items: true
      }
    })

    return order
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, user: RequestUser) {
    const order = await this.findOne(id, user)

    // 状态流转验证
    const allowedTransitions: Record<string, string[]> = {
      pending: ['paid', 'cancelled'],
      paid: ['shipped', 'refunded'],
      shipped: ['completed'],
      completed: [],
      cancelled: [],
      refunded: []
    }

    const allowed = allowedTransitions[order.status] || []

    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(`订单状态不能从 ${order.status} 变更为 ${dto.status}`)
    }

    const updateData: Prisma.OrderUpdateInput = {
      status: dto.status as OrderStatus
    }

    // 根据状态设置时间
    if (dto.status === 'paid') {
      updateData.paymentStatus = PaymentStatus.paid
      updateData.paidAt = new Date()
    } else if (dto.status === 'shipped') {
      updateData.shippingStatus = ShippingStatus.shipped
      updateData.shippedAt = new Date()
    } else if (dto.status === 'completed') {
      updateData.completedAt = new Date()
    } else if (dto.status === 'cancelled') {
      updateData.cancelledAt = new Date()
    } else if (dto.status === 'refunded') {
      updateData.paymentStatus = PaymentStatus.refunded
    }

    return this.prisma.order.update({
      where: { id },
      data: updateData
    })
  }

  async shipOrder(id: string, dto: ShipOrderDto, user: RequestUser) {
    const order = await this.findOne(id, user)

    if (order.status !== 'paid') {
      throw new BadRequestException('只能对已支付的订单发货')
    }

    return this.prisma.orderDelivery.create({
      data: {
        orderId: id,
        company: dto.company,
        trackingNo: dto.trackingNo,
        shippedAt: new Date()
      }
    })
  }

  async cancelOrder(id: string, user: RequestUser) {
    const order = await this.findOne(id, user)

    if (order.status !== 'pending') {
      throw new BadRequestException('只能取消待支付的订单')
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.cancelled,
        cancelledAt: new Date()
      }
    })
  }
}
