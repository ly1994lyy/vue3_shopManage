<script setup lang="ts">
import { NButton, NCard, NDescriptions, NDescriptionsItem, NTable, NTag, NSpace, useMessage } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { resolveErrorMessage } from '@/utils/error-message'
import { getOrderDetailApi, cancelOrderApi, shipOrderApi, type Order } from '../api'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const message = useMessage()

const loading = ref(false)
const order = ref<Order | null>(null)

const orderId = route.params.id as string

async function loadOrder() {
  loading.value = true
  try {
    const response = await getOrderDetailApi(orderId)
    order.value = response.data
  } catch (error) {
    message.error(resolveErrorMessage(error))
  } finally {
    loading.value = false
  }
}

async function handleShip() {
  const trackingNo = window.prompt(t('order.prompt.trackingNo'))

  if (!trackingNo || !order.value) return

  try {
    await shipOrderApi(order.value.id, {
      company: '快递物流',
      trackingNo
    })
    message.success(t('order.messages.shipped'))
    await loadOrder()
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

async function handleCancel() {
  if (!window.confirm(t('order.messages.confirmCancel')) || !order.value) return

  try {
    await cancelOrderApi(order.value.id)
    message.success(t('order.messages.cancelled'))
    await loadOrder()
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

const statusTone: Record<string, 'warning' | 'success' | 'info' | 'default' | 'error'> = {
  pending: 'warning',
  paid: 'info',
  shipped: 'info',
  completed: 'success',
  cancelled: 'error',
  refunded: 'error'
}

onMounted(loadOrder)
</script>

<template>
  <div v-if="order" class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-950 dark:text-white">{{ t('order.detail') }}</h1>
        <p class="text-sm text-slate-500">{{ order.orderNo }}</p>
      </div>
      <NSpace>
        <NButton @click="router.back()">{{ t('common.back') }}</NButton>
        <NButton v-if="order.status === 'paid'" type="success" @click="handleShip">{{ t('order.actions.ship') }}</NButton>
        <NButton v-if="order.status === 'pending'" type="error" @click="handleCancel">{{ t('order.actions.cancel') }}</NButton>
      </NSpace>
    </div>

    <NCard :title="t('order.sections.basic')" class="!rounded-3xl" :bordered="false">
      <NDescriptions :column="2" bordered>
        <NDescriptionsItem :label="t('order.columns.orderNo')">{{ order.orderNo }}</NDescriptionsItem>
        <NDescriptionsItem :label="t('order.columns.status')">
          <NTag :type="statusTone[order.status]" round>{{ t(`order.status.${order.status}`) }}</NTag>
        </NDescriptionsItem>
        <NDescriptionsItem :label="t('order.columns.totalAmount')">¥{{ Number(order.totalAmount).toFixed(2) }}</NDescriptionsItem>
        <NDescriptionsItem :label="t('order.columns.createdAt')">{{ new Date(order.createdAt).toLocaleString() }}</NDescriptionsItem>
        <NDescriptionsItem :label="t('order.columns.receiver')">{{ order.receiverName }}</NDescriptionsItem>
        <NDescriptionsItem :label="t('order.columns.phone')">{{ order.receiverPhone }}</NDescriptionsItem>
        <NDescriptionsItem :label="t('order.columns.address')" :span="2">{{ order.receiverAddress }}</NDescriptionsItem>
        <NDescriptionsItem v-if="order.remark" :label="t('order.columns.remark')" :span="2">{{ order.remark }}</NDescriptionsItem>
      </NDescriptions>
    </NCard>

    <NCard :title="t('order.sections.items')" class="!rounded-3xl" :bordered="false">
      <NTable :bordered="true" :single-line="false">
        <thead>
          <tr>
            <th>{{ t('order.columns.product') }}</th>
            <th>{{ t('order.columns.price') }}</th>
            <th>{{ t('order.columns.quantity') }}</th>
            <th>{{ t('order.columns.subtotal') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in order.items" :key="item.id">
            <td>
              <div class="flex items-center gap-3">
                <div v-if="item.cover" class="h-12 w-12 overflow-hidden rounded-lg">
                  <img :src="item.cover" class="h-full w-full object-cover" />
                </div>
                <div>
                  <p class="font-medium">{{ item.productName }}</p>
                  <p class="text-sm text-slate-500">{{ item.productCode }}</p>
                </div>
              </div>
            </td>
            <td>¥{{ Number(item.price).toFixed(2) }}</td>
            <td>{{ item.quantity }}</td>
            <td>¥{{ Number(item.subtotal).toFixed(2) }}</td>
          </tr>
        </tbody>
      </NTable>
    </NCard>

    <NCard :title="t('order.sections.amount')" class="!rounded-3xl" :bordered="false">
      <NDescriptions :column="1" bordered>
        <NDescriptionsItem :label="t('order.columns.subtotal')">¥{{ Number(order.subtotal).toFixed(2) }}</NDescriptionsItem>
        <NDescriptionsItem :label="t('order.columns.shippingFee')">¥{{ Number(order.shippingFee).toFixed(2) }}</NDescriptionsItem>
        <NDescriptionsItem :label="t('order.columns.discount')">-¥{{ Number(order.discount).toFixed(2) }}</NDescriptionsItem>
        <NDescriptionsItem :label="t('order.columns.totalAmount')">
          <span class="text-lg font-bold text-red-500">¥{{ Number(order.totalAmount).toFixed(2) }}</span>
        </NDescriptionsItem>
      </NDescriptions>
    </NCard>
  </div>

  <div v-else class="flex items-center justify-center py-20">
    <p class="text-slate-500">{{ t('common.loading') }}</p>
  </div>
</template>
