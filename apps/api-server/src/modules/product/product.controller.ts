import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuditLog } from '../../common/audit/audit-log.decorator'
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator'
import type { RequestUser } from '../../common/types/request-user'
import {
  CreateProductCategoryDto,
  CreateProductDto,
  QueryProductDto,
  UpdateProductCategoryDto,
  UpdateProductDto
} from './dto/product.dto'
import { ProductService } from './product.service'

@ApiTags('product')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('categories')
  @RequirePermissions('product:list:view')
  @ApiOperation({ summary: '商品分类列表' })
  findCategories(@CurrentUser() user: RequestUser, @CurrentTenantId() tenantId: string | null) {
    return this.productService.findCategories(user, tenantId)
  }

  @Post('categories')
  @RequirePermissions('product:category:submit')
  @AuditLog({ module: 'product', action: 'create-category', description: '创建商品分类' })
  @ApiOperation({ summary: '创建商品分类' })
  createCategory(
    @Body() dto: CreateProductCategoryDto,
    @CurrentUser() user: RequestUser,
    @CurrentTenantId() tenantId: string | null
  ) {
    return this.productService.createCategory(dto, user, tenantId)
  }

  @Patch('categories/:id')
  @RequirePermissions('product:category:submit')
  @AuditLog({ module: 'product', action: 'update-category', description: '更新商品分类' })
  @ApiOperation({ summary: '更新商品分类' })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateProductCategoryDto, @CurrentUser() user: RequestUser) {
    return this.productService.updateCategory(id, dto, user)
  }

  @Delete('categories/:id')
  @RequirePermissions('product:category:submit')
  @AuditLog({ module: 'product', action: 'delete-category', description: '删除商品分类' })
  @ApiOperation({ summary: '删除商品分类' })
  removeCategory(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.productService.removeCategory(id, user)
  }

  @Get()
  @RequirePermissions('product:list:view')
  @ApiOperation({ summary: '商品列表' })
  findMany(@Query() query: QueryProductDto, @CurrentUser() user: RequestUser, @CurrentTenantId() tenantId: string | null) {
    return this.productService.findMany(query, user, tenantId)
  }

  @Get(':id')
  @RequirePermissions('product:list:view')
  @ApiOperation({ summary: '商品详情' })
  findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.productService.findOne(id, user)
  }

  @Post()
  @RequirePermissions('product:create:submit')
  @AuditLog({ module: 'product', action: 'create', description: '创建商品' })
  @ApiOperation({ summary: '创建商品' })
  create(@Body() dto: CreateProductDto, @CurrentUser() user: RequestUser, @CurrentTenantId() tenantId: string | null) {
    return this.productService.create(dto, user, tenantId)
  }

  @Patch(':id')
  @RequirePermissions('product:update:submit')
  @AuditLog({ module: 'product', action: 'update', description: '更新商品' })
  @ApiOperation({ summary: '更新商品' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @CurrentUser() user: RequestUser) {
    return this.productService.update(id, dto, user)
  }

  @Delete(':id')
  @RequirePermissions('product:delete:submit')
  @AuditLog({ module: 'product', action: 'delete', description: '删除商品' })
  @ApiOperation({ summary: '删除商品' })
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.productService.remove(id, user)
  }
}
