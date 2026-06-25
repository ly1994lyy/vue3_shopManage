import { z } from 'zod'
import { PaginationQuerySchema } from './common'

/**
 * 租户状态枚举
 */
export const TenantStatusSchema = z.enum(['pending', 'active', 'disabled', 'expired'])
export type TenantStatus = z.infer<typeof TenantStatusSchema>

/**
 * 租户套餐枚举
 * - starter:   入门版（默认）
 * - standard:  标准版
 * - pro:       专业版
 * - enterprise:企业版
 */
export const TenantPlanSchema = z.enum(['starter', 'standard', 'pro', 'enterprise'])
export type TenantPlan = z.infer<typeof TenantPlanSchema>

export const TENANT_PLAN_OPTIONS = [
  { value: 'starter', labelKey: 'tenant.plan.starter' },
  { value: 'standard', labelKey: 'tenant.plan.standard' },
  { value: 'pro', labelKey: 'tenant.plan.pro' },
  { value: 'enterprise', labelKey: 'tenant.plan.enterprise' }
] as const

/**
 * 过期时间 Schema —— 接受 ISO 字符串或 null（"永不过期" 用 null 表示）
 * 通过 z.coerce.date() 自动转换 yyyy-MM-dd 这类日期选择器值
 */
const ExpiredAtSchema = z.union([z.coerce.date(), z.null()]).optional()

/**
 * 租户列表排序字段
 */
export const TenantSortBySchema = z.enum(['expiredAt', 'createdAt', 'name'])
export type TenantSortBy = z.infer<typeof TenantSortBySchema>

export const SortOrderSchema = z.enum(['asc', 'desc'])
export type SortOrder = z.infer<typeof SortOrderSchema>

/**
 * 查询租户列表 Schema
 */
export const QueryTenantsSchema = PaginationQuerySchema.extend({
  keyword: z.string().optional(),
  status: TenantStatusSchema.optional(),
  plan: TenantPlanSchema.optional(),
  sortBy: TenantSortBySchema.default('expiredAt'),
  sortOrder: SortOrderSchema.default('asc')
}).strict()
export type QueryTenantsInput = z.infer<typeof QueryTenantsSchema>

/**
 * 创建租户 Schema
 */
export const CreateTenantSchema = z
  .object({
    name: z.string().min(1, '租户名称不能为空'),
    code: z.string().min(1, '租户编码不能为空'),
    contact: z.string().optional(),
    phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号').optional(),
    email: z.string().email('请输入有效的邮箱').optional(),
    status: TenantStatusSchema.optional(),
    plan: TenantPlanSchema.default('starter'),
    expiredAt: ExpiredAtSchema
  })
  .strict()
export type CreateTenantInput = z.infer<typeof CreateTenantSchema>

/**
 * 更新租户 Schema
 */
export const UpdateTenantSchema = z
  .object({
    name: z.string().optional(),
    status: TenantStatusSchema.optional(),
    contact: z.string().optional(),
    phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号').optional(),
    email: z.string().email('请输入有效的邮箱').optional(),
    plan: TenantPlanSchema.optional(),
    expiredAt: ExpiredAtSchema
  })
  .strict()
export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>

/**
 * 续期租户 Schema（按月延长有效期）
 */
export const RenewTenantSchema = z
  .object({
    months: z.coerce.number().int().min(1, '至少续期 1 个月').max(120, '单次续期不能超过 120 个月'),
    plan: TenantPlanSchema.optional()
  })
  .strict()
export type RenewTenantInput = z.infer<typeof RenewTenantSchema>

/**
 * 初始化租户管理员 Schema
 */
export const InitTenantAdminSchema = z
  .object({
    account: z.string().min(1, '账号不能为空'),
    password: z.string().min(6, '密码至少 6 个字符'),
    name: z.string().min(1, '姓名不能为空'),
    email: z.string().email('请输入有效的邮箱').optional()
  })
  .strict()
export type InitTenantAdminInput = z.infer<typeof InitTenantAdminSchema>
