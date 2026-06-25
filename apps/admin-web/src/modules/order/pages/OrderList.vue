<script setup lang="ts">
import { NButton, NCard, NTag, NSpace, useMessage } from 'naive-ui'
import { computed, h, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import SearchForm from '@/components/SearchForm.vue'
import { resolveErrorMessage } from '@/utils/error-message'
import {
  getOrdersApi,
  cancelOrderApi,
  shipOrderApi,
  type Order,
  type OrderStatus,
  type QueryOrdersParams
} from '../api'

const { t } = useI18n()
const router = useRouter()
const message = useMessage()

const loading = ref(false)
const orders = ref<Order[]>([])
const total = ref(0)

const query = reactive<QueryOrdersParams>({
  page: 1,
  pageSize: 10,
  orderNo: '',
  status: undefined,
  startDate: '',
  endDate: ''
})

const statusOptions = computed(() => [
  { label: t('order.status.pending'), value: 'pending' },
  { label: t('order.status.paid'), value: 'paid' },
  { label: t('order.status.shipped'), value: 'shipped' },
  { label: t('order.status.completed'), value: 'completed' },
  { label: t('order.status.cancelled'), value: 'cancelled' },
  { label: t('order.status.refunded'), value: 'refunded' }
])

const searchFields = computed(() => [
  {
    key: 'orderNo',
    label: '',
    type: 'input' as const,
    placeholder: t('order.searchPlaceholder'),
    width: '220px'
  },
  {
    key: 'status',
    label: '',
    type: 'select' as const,
    placeholder: '请选择状态',
    options: statusOptions.value,
    width: '144px'
  }
])

const statusTone: Record<OrderStatus, 'warning' | 'success' | 'info' | 'default' | 'error'> = {
  pending: 'warning',
  paid: 'info',
  shipped: 'info',
  completed: 'success',
  cancelled: 'error',
  refunded: 'error'
}

const columns = computed(() => [
  {
    title: t('order.columns.orderNo'),
    key: 'orderNo',
    render: (row: Order) =>
      h(NButton, { text: true, type: 'primary', onClick: () => router.push(`/orders/${row.id}`) }, { default: () => row.orderNo })
  },
  {
    title: t('order.columns.totalAmount'),
    key: 'totalAmount',
    render: (row: Order) => `¥${Number(row.totalAmount).toFixed(2)}`
  },
  {
    title: t('order.columns.status'),
    key: 'status',
    render: (row: Order) =>
      h(NTag, { round: true, type: statusTone[row.status] }, { default: () => t(`order.status.${row.status}`) })
  },
  {
    title: t('order.columns.receiver'),
    key: 'receiver',
    render: (row: Order) => `${row.receiverName} ${row.receiverPhone}`
  },
  {
    title: t('order.columns.createdAt'),
    key: 'createdAt',
    render: (row: Order) => new Date(row.createdAt).toLocaleString()
  },
  {
    title: t('common.actions'),
    key: 'actions',
    width: 200,
    render: (row: Order) =>
      h(NSpace, null, {
        default: () => [
          h(NButton, { size: 'small', quaternary: true, type: 'primary', onClick: () => router.push(`/orders/${row.id}`) }, { default: () => t('order.actions.view') }),
          row.status === 'paid' ? h(NButton, { size: 'small', quaternary: true, type: 'success', onClick: () => handleShip(row) }, { default: () => t('order.actions.ship') }) : null,
          row.status === 'pending' ? h(NButton, { size: 'small', quaternary: true, type: 'error', onClick: () => handleCancel(row) }, { default: () => t('order.actions.cancel') }) : null
        ]
      })
  }
])

async function loadOrders() {
  loading.value = true
  try {
    const response = await getOrdersApi(query)
    orders.value = response.data.list
    total.value = response.data.pagination.total
  } catch (error) {
    message.error(resolveErrorMessage(error))
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.page = 1
  loadOrders()
}

function handleReset() {
  query.page = 1
  loadOrders()
}

async function handleShip(order: Order) {
  const trackingNo = window.prompt(t('order.prompt.trackingNo'))

  if (!trackingNo) return

  try {
    await shipOrderApi(order.id, {
      company: '快递物流',
      trackingNo
    })
    message.success(t('order.messages.shipped'))
    await loadOrders()
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

async function handleCancel(order: Order) {
  if (!window.confirm(t('order.messages.confirmCancel'))) return

  try {
    await cancelOrderApi(order.id)
    message.success(t('order.messages.cancelled'))
    await loadOrders()
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

onMounted(loadOrders)
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
      >
        <template #actions>
          <NButton type="primary" @click="router.push('/orders/create')">{{ t('order.actions.create') }}</NButton>
        </template>
      </SearchForm>

      <DataTable
        :columns="columns"
        :data="orders"
        :loading="loading"
        :pagination="{
          page: query.page,
          pageSize: query.pageSize,
          itemCount: total,
          onChange: (page: number) => { query.page = page; loadOrders() }
        }"
        @change="(page: number, pageSize?: number) => { query.page = page; if (pageSize) query.pageSize = pageSize; loadOrders() }"
      />
    </NCard>
  </div>
</template>
