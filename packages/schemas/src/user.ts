import { z } from 'zod'
import { PaginationQuerySchema } from './common'

/**
 * 用户类型枚举
 */
export const UserTypeSchema = z.enum(['platform', 'tenant', 'customer'])
export type UserType = z.infer<typeof UserTypeSchema>

/**
 * 用户状态枚举
 */
export const UserStatusSchema = z.enum(['active', 'disabled'])
export type UserStatus = z.infer<typeof UserStatusSchema>

/**
 * 查询用户列表 Schema
 */
export const QueryUsersSchema = PaginationQuerySchema.extend({
  keyword: z.string().optional(),
  status: UserStatusSchema.optional()
}).strict()
export type QueryUsersInput = z.infer<typeof QueryUsersSchema>

/**
 * 创建用户 Schema
 */
export const CreateUserSchema = z
  .object({
    account: z.string().min(1, '账号不能为空'),
    password: z.string().min(6, '密码至少 6 个字符'),
    name: z.string().min(1, '姓名不能为空'),
    tenantId: z.string().optional(),
    email: z.string().email('请输入有效的邮箱').optional(),
    type: UserTypeSchema.optional(),
    status: UserStatusSchema.optional()
  })
  .strict()
export type CreateUserInput = z.infer<typeof CreateUserSchema>

/**
 * 更新用户 Schema
 */
export const UpdateUserSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email('请输入有效的邮箱').optional(),
    status: UserStatusSchema.optional()
  })
  .strict()
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

/**
 * 分配用户角色 Schema
 */
export const AssignUserRolesSchema = z
  .object({
    roleIds: z.array(z.string()).min(1, '至少选择一个角色')
  })
  .strict()
export type AssignUserRolesInput = z.infer<typeof AssignUserRolesSchema>

/**
 * 重置用户密码 Schema
 */
export const ResetUserPasswordSchema = z
  .object({
    password: z.string().min(6, '密码至少 6 个字符')
  })
  .strict()
export type ResetUserPasswordInput = z.infer<typeof ResetUserPasswordSchema>
