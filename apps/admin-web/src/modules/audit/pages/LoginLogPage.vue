<script setup lang="ts">
import { NCard, NDataTable, NTag, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { computed, h, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SearchForm from '@/components/SearchForm.vue'
import { resolveErrorMessage } from '@/utils/error-message'
import { getLoginLogsApi, type LoginLogItem } from '../api'

const { t } = useI18n()
const message = useMessage()
const loading = ref(false)
const logs = ref<LoginLogItem[]>([])
const total = ref(0)

const query = reactive({
  page: 1,
  pageSize: 10,
  account: '',
  result: undefined as 'success' | 'failure' | undefined
})

const resultOptions = computed(() => [
  { label: t('audit.result.success'), value: 'success' },
  { label: t('audit.result.failure'), value: 'failure' }
])

const searchFields = computed(() => [
  {
    key: 'account',
    label: '',
    type: 'input' as const,
    placeholder: t('audit.columns.account'),
    width: '176px'
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

const columns = computed<DataTableColumns<LoginLogItem>>(() => [
  {
    title: t('audit.columns.time'),
    key: 'createdAt',
    width: 170,
    render: (row) => new Date(row.createdAt).toLocaleString()
  },
  { title: t('audit.columns.account'), key: 'account', width: 140 },
  { title: t('audit.columns.ip'), key: 'ip', width: 140 },
  {
    title: t('audit.columns.userAgent'),
    key: 'userAgent',
    minWidth: 320,
    render: (row) => h('span', { class: 'text-xs text-slate-500' }, row.userAgent || '-')
  },
  { title: t('audit.columns.description'), key: 'message', minWidth: 160 },
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
  }
])

async function loadLogs() {
  loading.value = true
  try {
    const res = await getLoginLogsApi({
      page: query.page,
      pageSize: query.pageSize,
      account: query.account || undefined,
      result: query.result
    })
    logs.value = res.data.list
    total.value = res.data.pagination.total
  } catch (err) {
    message.error(resolveErrorMessage(err))
  } finally {
    loading.value = false
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

onMounted(loadLogs)
</script>

<template>
  <div class="space-y-6">
    <NCard class="!rounded-3xl" :bordered="false">
      <SearchForm
        v-model="query"
        :fields="searchFields"
        :loading="loading"
        :search-label="t('common.search')"
        :reset-label="t('common.reset')"
        @search="handleSearch"
        @reset="handleReset"
      />
      <NDataTable
        :key="`login-logs-${total}`"
        :loading="loading"
        :columns="columns"
        :data="logs"
        :bordered="false"
        :remote="true"
        :pagination="{
          page: query.page,
          pageSize: query.pageSize,
          itemCount: total,
          showSizePicker: true,
          pageSizes: [10, 20, 50, 100],
          prefix: ({ itemCount }) => `共 ${itemCount ?? 0} 条`,
          onChange: (page: number) => { query.page = page; loadLogs() },
          onUpdatePageSize: (pageSize: number) => { query.page = 1; query.pageSize = pageSize; loadLogs() }
        }"
      />
    </NCard>
  </div>
</template>
