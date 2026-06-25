import { defineStore } from 'pinia'
import { i18n, type AppLocale } from '@/locales'

export const useAppStore = defineStore('app', {
  state: () => ({
    isDark: false,
    collapsed: false,
    locale: i18n.global.locale.value as AppLocale
  }),
  actions: {
    toggleTheme() {
      this.isDark = !this.isDark
      document.documentElement.classList.toggle('dark', this.isDark)
    },
    toggleCollapsed() {
      this.collapsed = !this.collapsed
    },
    setLocale(locale: AppLocale) {
      this.locale = locale
      i18n.global.locale.value = locale
      localStorage.setItem('shop-saas-locale', locale)
    }
  }
})
