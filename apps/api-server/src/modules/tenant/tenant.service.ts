import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { Prisma, RoleScope, TenantStatus, UserType } from '@prisma/client'
import * as argon2 from 'argon2'
import { ensureSameTenant } from '../../common/tenant/tenant-scope'
import type { RequestUser } from '../../common/types/request-user'
import { PrismaService } from '../../database/prisma.service'
import { CreateTenantDto, InitTenantAdminDto } from './dto/create-tenant.dto'
import { QueryTenantDto } from './dto/query-tenant.dto'
import { RenewTenantDto, UpdateTenantDto } from './dto/update-tenant.dto'

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 每日定时任务：凌晨 2 点，把已过期的 active 租户持久化为 expired 状态
   */
  @Cron('0 2 * * *', { timeZone: 'Asia/Shanghai' })
  async expireTenantsCron() {
    const now = new Date()
    const toExpire = await this.prisma.tenant.findMany({
      where: {
        status: TenantStatus.active,
        expiredAt: { not: null, lt: now }
      },
      select: { id: true, name: true, expiredAt: true }
    })

    if (!toExpire.length) {
      this.logger.log('No tenants to expire today')
      return
    }

    await this.prisma.tenant.updateMany({
      where: { id: { in: toExpire.map((t) => t.id) } },
      data: { status: TenantStatus.expired }
    })

    this.logger.log(`[cron] expired ${toExpire.length} tenants:`)
    for (const t of toExpire) {
      this.logger.log(
        `  - tenant "${t.name}" (${t.id}) expired at ${t.expiredAt?.toISOString().slice(0, 10)}`
      )
    }
  }

  /**
   * 把 Prisma 返回的租户记录归一化：根据 expiredAt 自动算出"是否已过期"
   * 注意：不在这里改库里的 status，避免每次读都触发写。
   * 真正的状态联动放在 update / renew 这些写入路径里。
   */
  private withExpiry<T extends { status: TenantStatus; expiredAt: Date | null }>(tenant: T) {
    const now = Date.now()
    const isExpired = tenant.expiredAt ? tenant.expiredAt.getTime() < now : false
    const daysRemaining = tenant.expiredAt
      ? Math.ceil((tenant.expiredAt.getTime() - now) / (24 * 60 * 60 * 1000))
      : null
    return {
      ...tenant,
      isExpired,
      // null = 永不过期；正数 = 剩余天数；负数 = 已过期天数
      daysRemaining,
      // 如果 DB 里还是 active 但实际已过期，对外展示 expired
      status: isExpired && tenant.status === TenantStatus.active ? TenantStatus.expired : tenant.status
    }
  }

  async findMany(query: QueryTenantDto, user: RequestUser) {
    const where: Prisma.TenantWhereInput = {
      ...(query.keyword
        ? {
            OR: [
              { name: { contains: query.keyword } },
              { code: { contains: query.keyword } },
              { contact: { contains: query.keyword } }
            ]
          }
        : {}),
      ...(query.status ? { status: query.status as TenantStatus } : {}),
      ...(query.plan ? { plan: query.plan } : {}),
      ...(user.type === UserType.tenant ? { id: user.tenantId || undefined } : {})
    }

    // 默认 expiredAt ASC nulls last → 越先过期的排前面，永不过期的在最后
    const orderBy: Prisma.TenantOrderByWithRelationInput[] =
      query.sortBy === 'expiredAt'
        ? [{ expiredAt: { sort: query.sortOrder === 'desc' ? 'desc' : 'asc', nulls: 'last' } }]
        : query.sortBy === 'name'
          ? [{ name: query.sortOrder === 'desc' ? 'desc' : 'asc' }]
          : [{ createdAt: query.sortOrder === 'desc' ? 'desc' : 'asc' }]

    const [list, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      this.prisma.tenant.count({ where })
    ])

    return {
      list: list.map((tenant) => this.withExpiry(tenant)),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total
      }
    }
  }

  async findOne(id: string, user?: RequestUser) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } })

    if (!tenant) {
      throw new NotFoundException('租户不存在')
    }

    if (user) {
      ensureSameTenant(user, tenant.id)
    }

    return this.withExpiry(tenant)
  }

  async create(dto: CreateTenantDto) {
    const existed = await this.prisma.tenant.findUnique({ where: { code: dto.code } })

    if (existed) {
      throw new ConflictException('租户编码已存在')
    }

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name,
        code: dto.code,
        contact: dto.contact,
        phone: dto.phone,
        email: dto.email,
        status: (dto.status as TenantStatus | undefined) ?? TenantStatus.pending,
        plan: dto.plan,
        expiredAt: dto.expiredAt ?? null
      }
    })

    return this.withExpiry(tenant)
  }

  async update(id: string, dto: UpdateTenantDto, user: RequestUser) {
    await this.findOne(id, user)

    // 显式拆字段：避免把 undefined 写进 Prisma 触发不必要的更新
    const data: Prisma.TenantUpdateInput = {}
    if (dto.name !== undefined) data.name = dto.name
    if (dto.status !== undefined) data.status = dto.status as TenantStatus
    if (dto.contact !== undefined) data.contact = dto.contact
    if (dto.phone !== undefined) data.phone = dto.phone
    if (dto.email !== undefined) data.email = dto.email
    if (dto.plan !== undefined) data.plan = dto.plan
    if (dto.expiredAt !== undefined) data.expiredAt = dto.expiredAt

    const tenant = await this.prisma.tenant.update({ where: { id }, data })
    return this.withExpiry(tenant)
  }

  /**
   * 续期：在当前 expiredAt 基础上累加 months 个月。
   * 如果当前已过期或从未设置，则从今天开始算。
   * 如果传了 plan，同时调整套餐。
   * 续期成功后状态自动回到 active。
   */
  async renew(id: string, dto: RenewTenantDto, user: RequestUser) {
    const current = await this.findOne(id, user)

    const base =
      current.expiredAt && current.expiredAt.getTime() > Date.now()
        ? new Date(current.expiredAt)
        : new Date()
    base.setMonth(base.getMonth() + dto.months)

    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: {
        expiredAt: base,
        status: TenantStatus.active,
        ...(dto.plan ? { plan: dto.plan } : {})
      }
    })

    return this.withExpiry(tenant)
  }

  async initAdmin(id: string, dto: InitTenantAdminDto, user: RequestUser) {
    const tenant = await this.findOne(id, user)
    const existed = await this.prisma.user.findUnique({ where: { account: dto.account } })

    if (existed) {
      throw new ConflictException('账号已存在')
    }

    const existedTenantRole = await this.prisma.role.findFirst({
      where: {
        tenantId: tenant.id,
        code: 'tenant_admin'
      }
    })

    const tenantRole = existedTenantRole
      ? await this.prisma.role.update({
          where: { id: existedTenantRole.id },
          data: {
            name: '租户管理员',
            scope: RoleScope.tenant
          }
        })
      : await this.prisma.role.create({
          data: {
            tenantId: tenant.id,
            name: '租户管理员',
            code: 'tenant_admin',
            scope: RoleScope.tenant
          }
        })

    const createdUser = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        account: dto.account,
        password: await argon2.hash(dto.password),
        name: dto.name,
        email: dto.email,
        type: UserType.tenant
      }
    })

    await this.prisma.userRole.create({
      data: {
        userId: createdUser.id,
        roleId: tenantRole.id
      }
    })

    return {
      tenant,
      user: {
        id: createdUser.id,
        tenantId: createdUser.tenantId,
        account: createdUser.account,
        name: createdUser.name,
        email: createdUser.email,
        type: createdUser.type,
        status: createdUser.status
      },
      role: tenantRole
    }
  }

  async remove(id: string, user: RequestUser) {
    await this.findOne(id, user)
    await this.prisma.tenant.delete({ where: { id } })

    return { success: true }
  }

  /**
   * 即将到期的租户列表 —— Dashboard 卡片用。
   * 返回未来 `withinDays` 天内到期的、以及已经过期的 active 租户。
   * 已禁用 (disabled) 的不算，因为它们无论如何不能用了。
   */
  async findExpiring(user: RequestUser, withinDays = 30, limit = 10) {
    const now = new Date()
    const cutoff = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000)

    const where: Prisma.TenantWhereInput = {
      status: { in: [TenantStatus.active, TenantStatus.expired] },
      expiredAt: { lte: cutoff, not: null },
      ...(user.type === UserType.tenant ? { id: user.tenantId || undefined } : {})
    }

    const list = await this.prisma.tenant.findMany({
      where,
      orderBy: { expiredAt: 'asc' },
      take: limit
    })

    return {
      withinDays,
      list: list.map((t) => this.withExpiry(t))
    }
  }
}
