import { z } from 'zod'

/**
 * 分页查询参数基础 Schema
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
})

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>

/**
 * 分页结果 Schema 工厂
 */
export const createPageResultSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    list: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      total: z.number()
    })
  })

/**
 * API 响应 Schema 工厂
 */
export const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    code: z.number(),
    message: z.string(),
    data: dataSchema,
    requestId: z.string()
  })

/**
 * 通用 ID Schema
 */
export const IdSchema = z.string().min(1)

/**
 * 价格 Schema（精确到 2 位小数）
 * Prisma Decimal 通过 JSON 序列化为字符串，需要 coerce
 */
export const PriceSchema = z.coerce.number().min(0).multipleOf(0.01)

/**
 * 库存数量 Schema
 */
export const StockSchema = z.coerce.number().int().min(0)

/**
 * URL Schema（可选）
 */
export const OptionalUrlSchema = z
  .string()
  .url()
  .optional()
  .or(z.literal(''))
  .transform((v) => (v === '' ? undefined : v))

/**
 * 日期字符串 Schema（ISO 8601）
 */
export const DateStringSchema = z.string().datetime().or(z.date()).optional()
