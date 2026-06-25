import { z } from 'zod'

/**
 * 角色范围枚举
 */
export const RoleScopeSchema = z.enum(['platform', 'tenant'])
export type RoleScope = z.infer<typeof RoleScopeSchema>

/**
 * 创建角色 Schema
 */
export const CreateRoleSchema = z
  .object({
    name: z.string().min(1, '角色名称不能为空'),
    code: z.string().min(1, '角色编码不能为空'),
    tenantId: z.string().optional(),
    scope: RoleScopeSchema.optional(),
    description: z.string().optional()
  })
  .strict()
export type CreateRoleInput = z.infer<typeof CreateRoleSchema>

/**
 * 更新角色 Schema
 */
export const UpdateRoleSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional()
  })
  .strict()
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>

/**
 * 分配角色权限 Schema
 */
export const AssignRolePermissionsSchema = z
  .object({
    permissionCodes: z.array(z.string()).min(1, '至少选择一个权限')
  })
  .strict()
export type AssignRolePermissionsInput = z.infer<typeof AssignRolePermissionsSchema>
