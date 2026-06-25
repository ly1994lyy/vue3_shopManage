import type { FormItemRule, FormRules } from 'naive-ui'
import { z, type ZodObject, type ZodRawShape, type ZodTypeAny } from 'zod'

/**
 * Naive UI 表单规则的触发时机
 */
type Trigger = 'blur' | 'change' | 'input' | 'focus'

/**
 * 字段级别的额外配置
 */
export interface ZodFieldOptions {
  /** 触发时机，默认 ['blur', 'input'] */
  trigger?: Trigger | Trigger[]
  /** 自定义错误消息（优先级高于 Schema 中的 message） */
  message?: string
}

/**
 * 将 Zod schema 转换为 Naive UI 表单校验规则
 *
 * 用法：
 * ```ts
 * const rules = zodToNaiveRules(CreateProductSchema, {
 *   name: { trigger: 'blur' },
 *   price: { trigger: ['blur', 'input'] }
 * })
 * ```
 */
export function zodToNaiveRules<TShape extends ZodRawShape>(
  schema: ZodObject<TShape>,
  fieldOptions: Partial<Record<keyof TShape, ZodFieldOptions>> = {}
): FormRules {
  const rules: FormRules = {}
  const shape = schema.shape

  for (const key of Object.keys(shape) as Array<keyof TShape & string>) {
    const fieldSchema = shape[key]
    const options = fieldOptions[key] || {}
    const trigger = options.trigger || ['blur', 'input']

    const rule: FormItemRule = {
      trigger,
      validator: (_rule, value) => {
        // 空值 + 字段可选时不校验（让必填规则处理）
        if ((value === undefined || value === null || value === '') && isOptional(fieldSchema)) {
          return true
        }

        const result = fieldSchema.safeParse(value)

        if (result.success) {
          return true
        }

        // 取第一条错误消息
        const firstError = result.error.issues[0]
        const message = options.message || firstError?.message || '校验失败'
        return new Error(message)
      }
    }

    rules[key] = rule
  }

  return rules
}

/**
 * 判断 Zod schema 是否可选
 */
function isOptional(schema: ZodTypeAny): boolean {
  if (schema instanceof z.ZodOptional) return true
  if (schema instanceof z.ZodNullable) return true
  if (schema instanceof z.ZodDefault) return true
  return false
}

/**
 * 使用 Zod schema 校验整个表单数据
 *
 * 返回校验结果，校验失败时返回字段级错误信息
 */
export function validateWithZod<T extends ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors: Record<string, string> = {}

  for (const issue of result.error.issues) {
    const path = issue.path.join('.')

    if (!errors[path]) {
      errors[path] = issue.message
    }
  }

  return { success: false, errors }
}
