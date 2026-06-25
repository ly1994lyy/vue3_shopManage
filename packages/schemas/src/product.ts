import { z } from 'zod'
import { IdSchema, PaginationQuerySchema, PriceSchema, StockSchema } from './common'

/**
 * 商品状态枚举
 */
export const ProductStatusSchema = z.enum(['draft', 'on_sale', 'off_sale', 'archived'])
export type ProductStatus = z.infer<typeof ProductStatusSchema>

/**
 * 商品状态选项（用于前端 Select）
 */
export const PRODUCT_STATUS_OPTIONS = [
  { value: 'draft', labelKey: 'product.status.draft' },
  { value: 'on_sale', labelKey: 'product.status.on_sale' },
  { value: 'off_sale', labelKey: 'product.status.off_sale' },
  { value: 'archived', labelKey: 'product.status.archived' }
] as const

/**
 * 商品分类基础 Schema
 */
export const ProductCategorySchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  parentId: z.string().nullable().optional(),
  name: z.string().min(1).max(50),
  sort: z.number().int().default(0),
  status: z.string().default('active'),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date())
})

export type ProductCategory = z.infer<typeof ProductCategorySchema>

/**
 * 商品完整 Schema（包含所有字段）
 */
export const ProductSchema = z.object({
  id: IdSchema,
  tenantId: z.string(),
  categoryId: z.string().nullable().optional(),
  name: z.string().min(2, '商品名称至少 2 个字符').max(100, '商品名称最多 100 个字符'),
  code: z
    .string()
    .min(1, '商品编码不能为空')
    .max(50, '商品编码最多 50 个字符')
    .regex(/^[A-Za-z0-9-_]+$/, '商品编码只能包含字母、数字、横线和下划线'),
  brief: z.string().max(500).nullable().optional(),
  description: z.string().nullable().optional(),
  price: PriceSchema,
  costPrice: PriceSchema.optional(),
  weight: z.coerce.number().min(0).optional(),
  stock: StockSchema,
  cover: z.string().nullable().optional(),
  images: z.array(z.string()).nullable().optional(),
  tags: z.string().nullable().optional(),
  status: ProductStatusSchema,
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  category: ProductCategorySchema.nullable().optional()
})

export type Product = z.infer<typeof ProductSchema>

/**
 * 创建商品 DTO Schema
 */
export const CreateProductSchema = z.object({
  name: z.string().min(2, '商品名称至少 2 个字符').max(100, '商品名称最多 100 个字符'),
  code: z
    .string()
    .min(1, '商品编码不能为空')
    .max(50, '商品编码最多 50 个字符')
    .regex(/^[A-Za-z0-9-_]+$/, '商品编码只能包含字母、数字、横线和下划线'),
  categoryId: z.string().optional(),
  brief: z.string().max(500).optional(),
  description: z.string().optional(),
  price: PriceSchema.default(0),
  costPrice: PriceSchema.optional(),
  weight: z.coerce.number().min(0).optional(),
  stock: StockSchema.default(0),
  cover: z.string().optional(),
  images: z.array(z.string()).optional(),
  status: ProductStatusSchema.default('draft')
}).strict()

export type CreateProductInput = z.infer<typeof CreateProductSchema>

/**
 * 更新商品 DTO Schema（所有字段可选）
 */
export const UpdateProductSchema = CreateProductSchema.partial().omit({ code: true }).strict()

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>

/**
 * 查询商品列表 Schema
 */
export const QueryProductsSchema = PaginationQuerySchema.extend({
  keyword: z.string().optional(),
  status: ProductStatusSchema.optional(),
  categoryId: z.string().optional()
}).strict()

export type QueryProductsInput = z.infer<typeof QueryProductsSchema>

/**
 * 创建分类 DTO Schema
 */
export const CreateCategorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空').max(50, '分类名称最多 50 个字符'),
  parentId: z.string().optional(),
  sort: z.coerce.number().int().default(0)
}).strict()

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>

/**
 * 更新分类 DTO Schema
 */
export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  status: z.enum(['active', 'disabled']).optional()
}).strict()

export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>
