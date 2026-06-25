import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, ProductStatus } from '@prisma/client'
import { ensureSameTenant, resolveTenantScope } from '../../common/tenant/tenant-scope'
import type { RequestUser } from '../../common/types/request-user'
import { PrismaService } from '../../database/prisma.service'
import {
  CreateProductCategoryDto,
  CreateProductDto,
  QueryProductDto,
  UpdateProductCategoryDto,
  UpdateProductDto
} from './dto/product.dto'

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async findCategories(user: RequestUser, requestedTenantId?: string | null) {
    const tenantId = resolveTenantScope(user, requestedTenantId)

    if (!tenantId) {
      return []
    }

    return this.prisma.productCategory.findMany({
      where: { tenantId },
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }]
    })
  }

  async createCategory(dto: CreateProductCategoryDto, user: RequestUser, requestedTenantId?: string | null) {
    const tenantId = resolveTenantScope(user, requestedTenantId)

    if (!tenantId) {
      throw new BadRequestException('请先选择租户')
    }

    if (dto.parentId) {
      const parent = await this.prisma.productCategory.findUnique({ where: { id: dto.parentId } })

      if (!parent || parent.tenantId !== tenantId) {
        throw new NotFoundException('父级分类不存在')
      }
    }

    return this.prisma.productCategory.create({
      data: {
        tenantId,
        name: dto.name,
        parentId: dto.parentId,
        sort: dto.sort ?? 0
      }
    })
  }

  async updateCategory(id: string, dto: UpdateProductCategoryDto, user: RequestUser) {
    const category = await this.prisma.productCategory.findUnique({ where: { id } })

    if (!category) {
      throw new NotFoundException('分类不存在')
    }

    ensureSameTenant(user, category.tenantId)

    return this.prisma.productCategory.update({
      where: { id },
      data: {
        name: dto.name,
        parentId: dto.parentId,
        sort: dto.sort,
        status: dto.status
      }
    })
  }

  async removeCategory(id: string, user: RequestUser) {
    const category = await this.prisma.productCategory.findUnique({ where: { id } })

    if (!category) {
      throw new NotFoundException('分类不存在')
    }

    ensureSameTenant(user, category.tenantId)

    await this.prisma.productCategory.delete({ where: { id } })

    return { success: true }
  }

  async findMany(query: QueryProductDto, user: RequestUser, requestedTenantId?: string | null) {
    const tenantId = resolveTenantScope(user, requestedTenantId)
    const where: Prisma.ProductWhereInput = {
      ...(tenantId ? { tenantId } : {}),
      ...(query.keyword
        ? {
            OR: [
              { name: { contains: query.keyword } },
              { code: { contains: query.keyword } }
            ]
          }
        : {}),
      ...(query.status ? { status: query.status as ProductStatus } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {})
    }

    const [list, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      this.prisma.product.count({ where })
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
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true }
    })

    if (!product) {
      throw new NotFoundException('商品不存在')
    }

    ensureSameTenant(user, product.tenantId)

    return product
  }

  async create(dto: CreateProductDto, user: RequestUser, requestedTenantId?: string | null) {
    const tenantId = resolveTenantScope(user, requestedTenantId)

    if (!tenantId) {
      throw new BadRequestException('请先选择租户')
    }

    if (dto.categoryId) {
      const category = await this.prisma.productCategory.findUnique({ where: { id: dto.categoryId } })

      if (!category || category.tenantId !== tenantId) {
        throw new NotFoundException('分类不存在')
      }
    }

    return this.prisma.product.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        categoryId: dto.categoryId,
        brief: dto.brief,
        description: dto.description,
        price: dto.price ?? 0,
        stock: dto.stock ?? 0,
        cover: dto.cover,
        status: (dto.status || 'draft') as ProductStatus
      }
    })
  }

  async update(id: string, dto: UpdateProductDto, user: RequestUser) {
    const product = await this.findOne(id, user)

    if (dto.categoryId) {
      const category = await this.prisma.productCategory.findUnique({ where: { id: dto.categoryId } })

      if (!category || category.tenantId !== product.tenantId) {
        throw new NotFoundException('分类不存在')
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        categoryId: dto.categoryId,
        brief: dto.brief,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        cover: dto.cover,
        status: dto.status as ProductStatus | undefined
      }
    })
  }

  async remove(id: string, user: RequestUser) {
    await this.findOne(id, user)
    await this.prisma.product.delete({ where: { id } })

    return { success: true }
  }
}
