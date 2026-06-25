import { z } from 'zod'
import { PaginationQuerySchema } from './common'

/**
 * 操作日志查询参数
 */
export const QueryOperationLogsSchema = PaginationQuerySchema.extend({
  module: z.string().optional(),
  action: z.string().optional(),
  result: z.enum(['success', 'failure']).optional(),
  userId: z.string().optional(),
  account: z.string().optional(),
  /** ISO 时间字符串 */
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  keyword: z.string().optional()
}).strict()
export type QueryOperationLogsInput = z.infer<typeof QueryOperationLogsSchema>

/**
 * 登录日志查询参数
 */
export const QueryLoginLogsSchema = PaginationQuerySchema.extend({
  account: z.string().optional(),
  result: z.enum(['success', 'failure']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
}).strict()
export type QueryLoginLogsInput = z.infer<typeof QueryLoginLogsSchema>
