import { defineStore } from 'pinia'
import { getTenantContext, setTenantContext } from '@shop-saas/auth'
import type { TenantSummary } from '@shop-saas/types'
import { i18n } from '@/locales'
import { getTenantOptionsApi } from '@/modules/tenant/api'

export const useTenantStore = defineStore('tenant', {
  state: () => ({
    currentTenantId: getTenantContext(),
    tenants: [] as TenantSummary[],
    loading: false
  }),
  getters: {
    options: (state) => [
      { label: i18n.global.t('common.allTenants'), value: '' },
      ...state.tenants.map((tenant) => ({
        label: tenant.name,
        value: tenant.id
      }))
    ]
  },
  actions: {
    async loadTenants() {
      this.loading = true

      try {
        const response = await getTenantOptionsApi()
        this.tenants = response.data.list
      } finally {
        this.loading = false
      }
    },
    setCurrentTenant(tenantId: string) {
      this.currentTenantId = tenantId
      setTenantContext(tenantId)
    }
  }
})
