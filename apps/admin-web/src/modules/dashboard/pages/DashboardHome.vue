<script setup lang="ts">
import { NButton, NCard, NProgress, NSpace, NTag, NEmpty } from 'naive-ui'
import type { TenantSummary } from '@shop-saas/types'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MetricCard from '@/components/MetricCard.vue'
import StatusPill from '@/components/StatusPill.vue'
import { getExpiringTenantsApi } from '@/modules/tenant/api'

const { t } = useI18n()
const router = useRouter()

const expiringTenants = ref<TenantSummary[]>([])
const expiringLoading = ref(false)

const tasks = [
  { name: '多租户模型设计', progress: 72, status: '进行中' },
  { name: '权限矩阵梳理', progress: 58, status: '进行中' },
  { name: '商品中心重构', progress: 36, status: '待推进' }
]

async function loadExpiring() {
  expiringLoading.value = true
  try {
    const res = await getExpiringTenantsApi({ withinDays: 30, limit: 6 })
    expiringTenants.value = res.data.list
  } catch {
    // 静默失败 —— Dashboard 不应该因为这个卡片报错就阻断整个页面
    expiringTenants.value = []
  } finally {
    expiringLoading.value = false
  }
}

function tagTypeForDays(days: number | null | undefined) {
  if (days == null) return 'default'
  if (days <= 0) return 'error'
  if (days <= 7) return 'error'
  if (days <= 30) return 'warning'
  return 'info'
}

function gotoTenants() {
  router.push('/tenants')
}

onMounted(loadExpiring)
</script>

<template>
  <div class="space-y-8">
    <section class="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-glow">
      <div class="absolute right-0 top-0 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
      <div class="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div class="relative flex items-center justify-between gap-8">
        <div>
          <p class="mb-3 text-sm font-semibold uppercase tracking-[.28em] text-indigo-200">{{ t('dashboard.overview') }}</p>
          <h2 class="max-w-3xl text-4xl font-black tracking-tight">{{ t('dashboard.heroTitle') }}</h2>
          <p class="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            {{ t('dashboard.heroDescription') }}
          </p>
        </div>
        <NSpace>
          <NButton type="primary" size="large" strong>{{ t('dashboard.createTenant') }}</NButton>
          <NButton size="large" ghost>{{ t('dashboard.viewArchitecture') }}</NButton>
        </NSpace>
      </div>
    </section>

    <section class="grid grid-cols-4 gap-5">
      <MetricCard :title="t('dashboard.metrics.tenants')" value="128" trend="+18.2%" tone="indigo" />
      <MetricCard :title="t('dashboard.metrics.gmv')" value="¥86.4k" trend="+12.8%" tone="emerald" />
      <MetricCard :title="t('dashboard.metrics.pendingOrders')" value="342" trend="+6.1%" tone="amber" />
      <MetricCard :title="t('dashboard.metrics.risks')" value="9" trend="-3.4%" tone="rose" />
    </section>

    <section class="grid grid-cols-[1.25fr_.75fr] gap-6">
      <NCard class="!rounded-3xl" :bordered="false">
        <template #header>
          <div>
            <h3 class="text-lg font-bold text-slate-950 dark:text-white">{{ t('dashboard.tasks') }}</h3>
            <p class="text-sm text-slate-500">{{ t('dashboard.tasksTip') }}</p>
          </div>
        </template>
        <div class="space-y-5">
          <div v-for="task in tasks" :key="task.name" class="rounded-2xl border border-slate-100 p-5 dark:border-slate-800">
            <div class="mb-3 flex items-center justify-between">
              <div>
                <p class="font-semibold text-slate-900 dark:text-white">{{ task.name }}</p>
                <p class="text-sm text-slate-500">{{ task.progress }}% completed</p>
              </div>
              <StatusPill :label="task.status" :tone="task.progress > 60 ? 'success' : 'warning'" />
            </div>
            <NProgress type="line" :percentage="task.progress" :show-indicator="false" processing />
          </div>
        </div>
      </NCard>

      <NCard class="!rounded-3xl" :bordered="false">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-slate-950 dark:text-white">{{ t('dashboard.expiringTenants') }}</h3>
              <p class="text-sm text-slate-500">{{ t('dashboard.expiringTenantsTip') }}</p>
            </div>
            <NButton text type="primary" @click="gotoTenants">{{ t('dashboard.viewAll') }}</NButton>
          </div>
        </template>
        <div v-if="expiringLoading" class="py-8 text-center text-slate-400">{{ t('common.loading') }}</div>
        <NEmpty v-else-if="!expiringTenants.length" :description="t('dashboard.noExpiring')" class="py-6" />
        <ul v-else class="space-y-3">
          <li
            v-for="tenant in expiringTenants"
            :key="tenant.id"
            class="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 dark:border-slate-800"
          >
            <div class="min-w-0">
              <p class="truncate font-semibold text-slate-900 dark:text-white">{{ tenant.name }}</p>
              <p class="mt-1 text-xs text-slate-500">
                {{ t(`tenant.plan.${tenant.plan}`) }} ·
                {{ tenant.expiredAt ? new Date(tenant.expiredAt).toLocaleDateString() : t('tenant.neverExpire') }}
              </p>
            </div>
            <NTag round size="small" :type="tagTypeForDays(tenant.daysRemaining)">
              <template v-if="tenant.daysRemaining == null">{{ t('tenant.neverExpire') }}</template>
              <template v-else-if="tenant.daysRemaining <= 0">
                {{ t('tenant.daysExpired', { days: Math.abs(tenant.daysRemaining) }) }}
              </template>
              <template v-else>{{ t('tenant.daysRemaining', { days: tenant.daysRemaining }) }}</template>
            </NTag>
          </li>
        </ul>
      </NCard>
    </section>

    <NCard class="!rounded-3xl" :bordered="false">
      <template #header>
        <h3 class="text-lg font-bold text-slate-950 dark:text-white">{{ t('dashboard.keywords') }}</h3>
      </template>
      <div class="flex flex-wrap gap-3">
        <StatusPill label="pnpm workspace" />
        <StatusPill label="Vue 3" tone="success" />
        <StatusPill label="TypeScript" />
        <StatusPill label="Tailwind CSS" tone="success" />
        <StatusPill label="Naive UI" tone="info" />
        <StatusPill label="NestJS" tone="danger" />
        <StatusPill label="Multi-tenant" tone="warning" />
      </div>
    </NCard>
  </div>
</template>
