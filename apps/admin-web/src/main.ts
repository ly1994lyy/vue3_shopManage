import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { setSessionRefreshedHandler, setUnauthorizedHandler } from '@shop-saas/api-client'
import type { UserProfile } from '@shop-saas/types'
import App from './App.vue'
import { i18n } from './locales'
import { router } from './router'
import { useAuthStore } from './stores/auth.store'
import { usePermissionStore } from './stores/permission.store'
import './styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia).use(i18n).use(router)

// 从 localStorage 缓存的 profile 把权限灌进 store，避免 F5 后回退到默认列表
useAuthStore().syncPermissionsFromCache()

// refresh 自动续期成功 → 把新返回的 user 同步到 store 和缓存，
// 避免权限漂移（后端期间改过用户角色也能立即生效）
setSessionRefreshedHandler((user) => {
  if (user && typeof user === 'object') {
    const profile = user as UserProfile
    const authStore = useAuthStore()
    authStore.profile = profile
    localStorage.setItem('shop-saas-profile', JSON.stringify(profile))
    usePermissionStore().setPermissions(profile.permissions)
  }
})

// token 失效（refresh 也救不回来）→ 清状态并跳登录页
setUnauthorizedHandler(() => {
  const authStore = useAuthStore()
  authStore.logout()
  const current = router.currentRoute.value
  if (current.name !== 'login') {
    router.push({ name: 'login', query: { redirect: current.fullPath } })
  }
})

app.mount('#app')
