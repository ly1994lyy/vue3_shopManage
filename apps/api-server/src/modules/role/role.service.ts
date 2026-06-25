import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, RoleScope } from '@prisma/client'
import { PrismaService } from '../../database/prisma.service'
import { AssignRolePermissionsDto, CreateRoleDto, UpdateRoleDto } from './dto/role.dto'

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  findMany() {
    return this.prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    })

    if (!role) {
      throw new NotFoundException('角色不存在')
    }

    return role
  }

  async create(dto: CreateRoleDto) {
    const existed = await this.prisma.role.findFirst({
      where: {
        tenantId: dto.tenantId || null,
        code: dto.code
      }
    })

    if (existed) {
      throw new ConflictException('角色编码已存在')
    }

    return this.prisma.role.create({
      data: {
        tenantId: dto.tenantId,
        name: dto.name,
        code: dto.code,
        description: dto.description,
        scope: (dto.scope || 'tenant') as RoleScope
      }
    })
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id)

    return this.prisma.role.update({
      where: { id },
      data: dto
    })
  }

  async assignPermissions(id: string, dto: AssignRolePermissionsDto) {
    await this.findOne(id)

    const permissions = await this.prisma.permission.findMany({
      where: {
        code: { in: dto.permissionCodes }
      }
    })

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId: id } }),
      ...permissions.map((permission) =>
        this.prisma.rolePermission.create({
          data: {
            roleId: id,
            permissionId: permission.id
          }
        })
      )
    ] as Prisma.PrismaPromise<unknown>[])

    return this.findOne(id)
  }
}
