<script setup lang="ts">
import {
  AnalyticsOutline,
  AppsOutline,
  BagHandleOutline,
  BusinessOutline,
  DocumentTextOutline,
  LogOutOutline,
  MoonOutline,
  PeopleOutline,
  SettingsOutline,
  SunnyOutline
} from '@vicons/ionicons5'
import { NAvatar, NButton, NIcon, NLayout, NLayoutContent, NLayoutSider, NMenu, NSelect } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import { computed, h, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { SUPPORT_LOCALES } from '@/locales'
import type { AppMenuItem, MenuIconName } from '@/router/menus'
import { useAppStore } from '@/stores/app.store'
import { useAuthStore } from '@/stores/auth.store'
import { usePermissionStore } from '@/stores/permission.store'
import { useTenantStore } from '@/stores/tenant.store'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const tenantStore = useTenantStore()
const { t } = useI18n()

// 类型钉死：menus.ts 加了新 MenuIconName 但忘了在这里实现 → 编译报错
const iconMap: Record<MenuIconName, typeof AppsOutline> = {
  analytics: AnalyticsOutline,
  apps: AppsOutline,
  bag: BagHandleOutline,
  business: BusinessOutline,
  'document-text': DocumentTextOutline,
  people: PeopleOutline,
  settings: SettingsOutline
}

const renderIcon = (icon: MenuIconName) => () => {
  const resolved = iconMap[icon] || AppsOutline
  return h(NIcon, null, { default: () => h(resolved) })
}

function toMenuOption(menu: AppMenuItem): MenuOption {
  const hasChildren = Boolean(menu.children?.length)
  return {
    label: hasChildren
      ? t(menu.titleKey)
      : menu.path
        ? () => h(RouterLink, { to: menu.path as string }, { default: () => t(menu.titleKey) })
        : t(menu.titleKey),
    key: menu.key,
    icon: renderIcon(menu.icon),
    children: hasChildren ? menu.children!.map(toMenuOption) : undefined
  }
}

const menuOptions = computed(() => permissionStore.menus.map(toMenuOption))

function findMenuKeyByPath(menus: AppMenuItem[], path: string): string | null {
  for (const menu of menus) {
    if (menu.path && (path === menu.path || path.startsWith(`${menu.path}/`))) {
      return menu.key
    }

    if (menu.children?.length) {
      const childKey = findMenuKeyByPath(menu.children, path)

      if (childKey) {
        return childKey
      }
    }
  }

  return null
}

const activeMenuKey = computed(() => findMenuKeyByPath(permissionStore.menus, route.path) || String(route.name || 'dashboard'))

const canSwitchTenant = computed(() => authStore.profile?.type === 'platform')

function onTenantChange(tenantId: string) {
  tenantStore.setCurrentTenant(tenantId)
}

const routeKey = computed(() => `${route.fullPath}::${tenantStore.currentTenantId || 'all'}`)

onMounted(() => {
  if (canSwitchTenant.value) {
    tenantStore.loadTenants()
  }
})

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <NLayout has-sider class="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
    <NLayoutSider
      bordered
      collapse-mode="width"
      :collapsed="appStore.collapsed"
      :collapsed-width="84"
      :width="276"
      class="!h-screen bg-white/85 backdrop-blur-xl dark:!bg-slate-950/80"
    >
      <div class="flex h-20 items-center gap-3 px-6">
        <div class="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-lg font-black text-white shadow-glow">
          S
        </div>
        <div v-if="!appStore.collapsed">
          <p class="text-base font-bold text-slate-950 dark:text-white">{{ t('common.appName') }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">Multi-tenant Console</p>
        </div>
      </div>

      <NMenu
        :collapsed="appStore.collapsed"
        :collapsed-width="84"
        :collapsed-icon-size="22"
        :value="activeMenuKey"
        :options="menuOptions"
        class="px-3"
      />
    </NLayoutSider>

    <NLayout class="!h-screen !overflow-hidden !bg-transparent">
      <header class="z-20 flex h-20 shrink-0 items-center justify-between border-b border-white/70 bg-white/70 px-8 backdrop-blur-xl dark:!border-slate-800 dark:!bg-slate-950/70">
        <div>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('common.subtitle') }}</p>
          <h1 class="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {{ route.meta.title ? t(String(route.meta.title)) : t('dashboard.title') }}
          </h1>
        </div>

        <div class="flex items-center gap-3">
          <NSelect
            v-if="canSwitchTenant"
            :value="tenantStore.currentTenantId"
            :options="tenantStore.options"
            :loading="tenantStore.loading"
            size="small"
            class="w-44"
            @update:value="onTenantChange"
          />
          <NSelect
            :value="appStore.locale"
            :options="SUPPORT_LOCALES"
            size="small"
            class="w-28"
            @update:value="appStore.setLocale"
          />
          <NButton circle quaternary @click="appStore.toggleTheme">
            <template #icon>
              <NIcon :component="appStore.isDark ? SunnyOutline : MoonOutline" />
            </template>
          </NButton>
          <div class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <NAvatar round size="small" color="#4f46e5">管</NAvatar>
            <div class="hidden text-sm md:block">
              <p class="font-semibold text-slate-900 dark:text-white">{{ authStore.profile?.name }}</p>
              <p class="text-xs text-slate-500">平台超级管理员</p>
            </div>
          </div>
          <NButton quaternary circle @click="logout">
            <template #icon>
              <NIcon :component="LogOutOutline" />
            </template>
          </NButton>
        </div>
      </header>

      <NLayoutContent class="h-[calc(100vh-5rem)] overflow-y-auto p-8">
        <RouterView :key="routeKey" />
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>
