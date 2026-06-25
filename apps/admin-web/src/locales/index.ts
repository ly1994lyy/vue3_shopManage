import { createI18n } from 'vue-i18n'
import enUS from './en-US'
import zhCN from './zh-CN'

export type AppLocale = 'zh-CN' | 'en-US'

export const SUPPORT_LOCALES: Array<{ label: string; value: AppLocale }> = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

export const i18n = createI18n({
  legacy: false,
  locale: (localStorage.getItem('shop-saas-locale') as AppLocale | null) || 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})
