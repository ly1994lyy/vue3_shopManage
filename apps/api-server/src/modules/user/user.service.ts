import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, UserStatus, UserType } from '@prisma/client'
import * as argon2 from 'argon2'
import { ensureSameTenant, resolveTenantScope } from '../../common/tenant/tenant-scope'
import type { RequestUser } from '../../common/types/request-user'
import { PrismaService } from '../../database/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { AssignUserRolesDto, QueryUserDto, ResetUserPasswordDto, UpdateUserDto } from './dto/user.dto'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: QueryUserDto, user: RequestUser, requestedTenantId?: string | null) {
    const tenantId = resolveTenantScope(user, requestedTenantId)
    const where: Prisma.UserWhereInput = {
      ...(query.keyword
        ? {
            OR: [
              { name: { contains: query.keyword } },
              { account: { contains: query.keyword } },
              { email: { contains: query.keyword } }
            ]
          }
        : {}),
      ...(query.status ? { status: query.status as UserStatus } : {}),
      ...(tenantId ? { tenantId } : {})
    }

    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          tenantId: true,
          account: true,
          name: true,
          email: true,
          phone: true,
          type: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          userRoles: {
            select: {
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      this.prisma.user.count({ where })
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

  async findOne(id: string, user?: RequestUser) {
    const foundUser = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        tenantId: true,
        account: true,
        name: true,
        email: true,
        phone: true,
        type: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!foundUser) {
      throw new NotFoundException('用户不存在')
    }

    if (user) {
      ensureSameTenant(user, foundUser.tenantId)
    }

    return foundUser
  }

  async create(dto: CreateUserDto, user: RequestUser, requestedTenantId?: string | null) {
    const tenantId = resolveTenantScope(user, dto.tenantId || requestedTenantId)
    const existed = await this.prisma.user.findUnique({ where: { account: dto.account } })

    if (existed) {
      throw new ConflictException('账号已存在')
    }

    const createdUser = await this.prisma.user.create({
      data: {
        account: dto.account,
        password: await argon2.hash(dto.password),
        name: dto.name,
        tenantId,
        email: dto.email,
        type: (dto.type || 'tenant') as UserType
      }
    })

    return this.findOne(createdUser.id, user)
  }

  async update(id: string, dto: UpdateUserDto, user: RequestUser) {
    await this.findOne(id, user)

    await this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
        status: dto.status as UserStatus | undefined
      }
    })

    return this.findOne(id, user)
  }

  async assignRoles(id: string, dto: AssignUserRolesDto, user: RequestUser) {
    const targetUser = await this.findOne(id, user)

    if (dto.roleIds.length) {
      const roles = await this.prisma.role.findMany({
        where: {
          id: { in: dto.roleIds }
        }
      })

      roles.forEach((role) => ensureSameTenant(user, role.tenantId))
    }

    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userId: targetUser.id } }),
      ...dto.roleIds.map((roleId) =>
        this.prisma.userRole.create({
          data: {
            userId: targetUser.id,
            roleId
          }
        })
      )
    ] as Prisma.PrismaPromise<unknown>[])

    return this.findOne(id, user)
  }

  async resetPassword(id: string, dto: ResetUserPasswordDto, user: RequestUser) {
    const targetUser = await this.findOne(id, user)

    await this.prisma.user.update({
      where: { id: targetUser.id },
      data: {
        password: await argon2.hash(dto.password)
      }
    })

    return { success: true }
  }
}
