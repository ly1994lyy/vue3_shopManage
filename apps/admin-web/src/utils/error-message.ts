import { ApiClientError } from '@shop-saas/api-client'
import { i18n } from '@/locales'

/**
 * 这几个 code 必须使用本地化的统一文案 —— 即使后端给了 message，
 * 也以前端的为准（场景：500 屏蔽内部错误细节）。
 *
 * 注意：40001（未授权）不放在这里 —— 它既可能是"密码错误"也可能是"token 过期"，
 * 后端 message 才能区分。
 */
const FORCED_I18N_CODES: Record<number, string> = {
  50000: 'errors.serverError'
}

/**
 * 兜底文案：后端没有给 message 且 code 也不在 FORCED 表里时使用。
 */
const FALLBACK_I18N_BY_CODE: Record<number, string> = {
  40000: 'errors.badRequest',
  40001: 'errors.unauthorized',
  40003: 'errors.forbidden',
  40004: 'errors.notFound',
  40009: 'errors.conflict',
  40100: 'errors.tenantUnavailable'
}

export function resolveErrorMessage(error: unknown, fallbackKey = 'errors.unknown') {
  if (error instanceof ApiClientError) {
    // 1) 一些场景统一用本地化文案
    if (error.code && FORCED_I18N_CODES[error.code]) {
      return i18n.global.t(FORCED_I18N_CODES[error.code])
    }

    // 2) 优先展示后端 message（业务上下文最准）
    if (error.message) {
      return error.message
    }

    // 3) 后端没给 message，按 code 兜底翻译
    if (error.code && FALLBACK_I18N_BY_CODE[error.code]) {
      return i18n.global.t(FALLBACK_I18N_BY_CODE[error.code])
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return i18n.global.t(fallbackKey)
}
