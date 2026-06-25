<script setup lang="ts">
import { NButton, NCard, NDescriptions, NDescriptionsItem, NDrawer, NDrawerContent, NTag, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { computed, h, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import PermissionButton from '@/components/PermissionButton.vue'
import SearchForm from '@/components/SearchForm.vue'
import { resolveErrorMessage } from '@/utils/error-message'
import {
  cleanupAuditLogsApi,
  getOperationLogsApi,
  getOperationLogStatsApi,
  type OperationLogItem,
  type OperationLogStats
} from '../api'

const { t } = useI18n()
const message = useMessage()
const loading = ref(false)
const logs = ref<OperationLogItem[]>([])
const total = ref(0)
const stats = ref<OperationLogStats>({ total: 0, failures: 0, last24h: 0 })

const drawerVisible = ref(false)
const drawerLog = ref<OperationLogItem | null>(null)

const query = reactive({
  page: 1,
  pageSize: 10,
  module: undefined as string | undefined,
  result: undefined as 'success' | 'failure' | undefined,
  account: '',
  keyword: ''
})

const moduleOptions = computed(() => [
  { label: t('audit.modules.tenant'), value: 'tenant' },
  { label: t('audit.modules.user'), value: 'user' },
  { label: t('audit.modules.role'), value: 'role' },
  { label: t('audit.modules.product'), value: 'product' },
  { label: t('audit.modules.order'), value: 'order' }
])

const resultOptions = computed(() => [
  { label: t('audit.result.success'), value: 'success' },
  { label: t('audit.result.failure'), value: 'failure' }
])

const searchFields = computed(() => [
  {
    key: 'keyword',
    label: '',
    type: 'input' as const,
    placeholder: t('audit.searchPlaceholder'),
    width: '220px'
  },
  {
    key: 'module',
    label: '',
    type: 'select' as const,
    placeholder: '请选择模块',
    options: moduleOptions.value,
    width: '128px'
  },
  {
    key: 'result',
    label: '',
    type: 'select' as const,
    placeholder: '请选择结果',
    options: resultOptions.value,
    width: '112px'
  }
])

const columns = computed<DataTableColumns<OperationLogItem>>(() => [
  {
    title: t('audit.columns.time'),
    key: 'createdAt',
    width: 170,
    render: (row) => new Date(row.createdAt).toLocaleString()
  },
  { title: t('audit.columns.account'), key: 'account', width: 140 },
  {
    title: t('audit.columns.module'),
    key: 'module',
    width: 100,
    render: (row) =>
      h(NTag, { round: true, size: 'small', type: 'info' }, { default: () => row.module })
  },
  { title: t('audit.columns.action'), key: 'action', width: 130 },
  { title: t('audit.columns.description'), key: 'message', minWidth: 160 },
  {
    title: t('audit.columns.path'),
    key: 'path',
    minWidth: 220,
    render: (row) =>
      h('span', { class: 'font-mono text-xs text-slate-600 dark:text-slate-300' }, `${row.method || ''} ${row.path || ''}`)
  },
  { title: t('audit.columns.ip'), key: 'ip', width: 130 },
  {
    title: t('audit.columns.duration'),
    key: 'durationMs',
    width: 90,
    render: (row) => (row.durationMs != null ? `${row.durationMs} ms` : '-')
  },
  {
    title: t('audit.columns.result'),
    key: 'result',
    width: 90,
    render: (row) =>
      h(
        NTag,
        { round: true, size: 'small', type: row.result === 'success' ? 'success' : 'error' },
        { default: () => t(`audit.result.${row.result}`) }
      )
  },
  {
    title: t('common.actions'),
    key: 'actions',
    width: 90,
    fixed: 'right',
    render: (row) =>
      h(NButton, { size: 'tiny', text: true, type: 'primary', onClick: () => openDrawer(row) }, { default: () => t('audit.detail') })
  }
])

const prettyPayload = computed(() => {
  const raw = drawerLog.value?.payload
  if (!raw) return null
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
})

function openDrawer(row: OperationLogItem) {
  drawerLog.value = row
  drawerVisible.value = true
}

async function loadLogs() {
  loading.value = true
  try {
    const res = await getOperationLogsApi({
      page: query.page,
      pageSize: query.pageSize,
      module: query.module,
      result: query.result,
      account: query.account || undefined,
      keyword: query.keyword || undefined
    })
    logs.value = res.data.list
    total.value = res.data.pagination.total
  } catch (err) {
    message.error(resolveErrorMessage(err))
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const res = await getOperationLogStatsApi()
    stats.value = res.data
  } catch {
    // ignore
  }
}

function handleSearch() {
  query.page = 1
  loadLogs()
}

function handleReset() {
  query.page = 1
  loadLogs()
}

async function handleCleanup() {
  try {
    const res = await cleanupAuditLogsApi()
    const { operation, login } = res.data
    message.success(t('audit.cleanup.success', { ops: operation.deleted, logins: login.deleted }))
    await Promise.all([loadLogs(), loadStats()])
  } catch (err) {
    message.error(resolveErrorMessage(err))
  }
}

onMounted(() => {
  loadLogs()
  loadStats()
})
</script>

<template>
  <div class="space-y-6">
    <section class="grid grid-cols-3 gap-5">
      <MetricCard :title="t('audit.metrics.total')" :value="String(stats.total)" trend="" tone="indigo" />
      <MetricCard :title="t('audit.metrics.last24h')" :value="String(stats.last24h)" trend="" tone="emerald" />
      <MetricCard :title="t('audit.metrics.failures')" :value="String(stats.failures)" trend="" tone="rose" />
    </section>

    <NCard class="!rounded-3xl" :bordered="false">
      <SearchForm
        v-model="query"
        :fields="searchFields"
        :loading="loading"
        :search-label="t('common.search')"
        :reset-label="t('common.reset')"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #actions>
          <PermissionButton permission="audit:cleanup:submit" type="warning" @click="handleCleanup">
            {{ t('audit.cleanup.action') }}
          </PermissionButton>
        </template>
      </SearchForm>
      <DataTable
        :loading="loading"
        :columns="columns"
        :data="logs"
        :scroll-x="1500"
        :pagination="{
          page: query.page,
          pageSize: query.pageSize,
          itemCount: total,
          onChange: (page: number) => { query.page = page; loadLogs() }
        }"
        @change="(page: number, pageSize?: number) => { query.page = page; if (pageSize) query.pageSize = pageSize; loadLogs() }"
      />
    </NCard>

    <NDrawer v-model:show="drawerVisible" :width="560">
      <NDrawerContent :title="t('audit.detail')" closable>
        <template v-if="drawerLog">
          <NDescriptions bordered label-placement="left" :column="1" size="small">
            <NDescriptionsItem :label="t('audit.columns.time')">
              {{ new Date(drawerLog.createdAt).toLocaleString() }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('audit.columns.account')">{{ drawerLog.account || '-' }}</NDescriptionsItem>
            <NDescriptionsItem :label="t('audit.columns.module')">{{ drawerLog.module }}</NDescriptionsItem>
            <NDescriptionsItem :label="t('audit.columns.action')">{{ drawerLog.action }}</NDescriptionsItem>
            <NDescriptionsItem :label="t('audit.columns.description')">{{ drawerLog.message || '-' }}</NDescriptionsItem>
            <NDescriptionsItem :label="t('audit.columns.path')">
              <span class="font-mono text-xs">{{ drawerLog.method }} {{ drawerLog.path }}</span>
            </NDescriptionsItem>
            <NDescriptionsItem label="Target ID">
              <span class="font-mono text-xs">{{ drawerLog.targetId || '-' }}</span>
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('audit.columns.ip')">{{ drawerLog.ip || '-' }}</NDescriptionsItem>
            <NDescriptionsItem :label="t('audit.columns.userAgent')">
              <span class="text-xs">{{ drawerLog.userAgent || '-' }}</span>
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('audit.columns.duration')">
              {{ drawerLog.durationMs != null ? `${drawerLog.durationMs} ms` : '-' }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('audit.columns.result')">
              <NTag round size="small" :type="drawerLog.result === 'success' ? 'success' : 'error'">
                {{ t(`audit.result.${drawerLog.result}`) }}
              </NTag>
            </NDescriptionsItem>
            <NDescriptionsItem label="Request ID">
              <span class="font-mono text-xs">{{ drawerLog.requestId || '-' }}</span>
            </NDescriptionsItem>
          </NDescriptions>

          <div class="mt-5">
            <p class="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {{ t('audit.payload') }}
            </p>
            <pre
              v-if="prettyPayload"
              class="max-h-[420px] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >{{ prettyPayload }}</pre>
            <p v-else class="text-xs text-slate-400">{{ t('audit.payloadEmpty') }}</p>
          </div>
        </template>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>
