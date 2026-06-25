import { z } from 'zod'

/**
 * 登录 Schema
 */
export const LoginSchema = z
  .object({
    account: z.string().min(1, '账号不能为空'),
    password: z.string().min(6, '密码至少 6 个字符')
  })
  .strict()
export type LoginInput = z.infer<typeof LoginSchema>

/**
 * 刷新 Token Schema
 */
export const RefreshTokenSchema = z
  .object({
    refreshToken: z.string().min(1, 'refreshToken 不能为空')
  })
  .strict()
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>
