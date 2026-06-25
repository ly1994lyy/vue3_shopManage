import { defineStore } from 'pinia'
import { clearTokens, getAccessToken, setAccessToken, setRefreshToken } from '@shop-saas/auth'
import type { UserProfile } from '@shop-saas/types'
import { getProfileApi, loginApi, type LoginPayload } from '@/modules/auth/api'
import { usePermissionStore } from '@/stores/permission.store'

const PROFILE_KEY = 'shop-saas-profile'

function getCachedProfile() {
  const raw = localStorage.getItem(PROFILE_KEY)
  return raw ? (JSON.parse(raw) as UserProfile) : null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getAccessToken(),
    profile: getCachedProfile()
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token)
  },
  actions: {
    async login(payload: LoginPayload) {
      const response = await loginApi(payload)
      const result = response.data

      this.token = result.accessToken
      this.profile = result.user
      setAccessToken(result.accessToken)
      setRefreshToken(result.refreshToken)
      localStorage.setItem(PROFILE_KEY, JSON.stringify(result.user))
      usePermissionStore().setPermissions(result.user.permissions)
    },
    async loadProfile() {
      const response = await getProfileApi()
      this.profile = response.data
      localStorage.setItem(PROFILE_KEY, JSON.stringify(response.data))
      usePermissionStore().setPermissions(response.data.permissions)
    },
    syncPermissionsFromCache() {
      if (this.profile?.permissions) {
        usePermissionStore().setPermissions(this.profile.permissions)
      }
    },
    logout() {
      this.token = ''
      this.profile = null
      clearTokens()
      localStorage.removeItem(PROFILE_KEY)
      usePermissionStore().reset()
    }
  }
})
