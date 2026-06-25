<script setup lang="ts">
import { NButton, NCard, NForm, NFormItem, NInput, NInputNumber, NModal, NTable, useMessage } from 'naive-ui'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { resolveErrorMessage } from '@/utils/error-message'
import { getProductsApi, type ProductItem } from '@/modules/product/api'
import { createOrderApi, type CreateOrderPayload, type CreateOrderItem } from '../api'

// 扩展商品项类型，包含价格信息
interface OrderItemWithPrice extends CreateOrderItem {
  price?: number
}

const { t } = useI18n()
const router = useRouter()
const message = useMessage()

const submitting = ref(false)

// 商品选择相关
const productModalVisible = ref(false)
const products = ref<ProductItem[]>([])
const productLoading = ref(false)
const productQuery = reactive({
  keyword: '',
  status: 'on_sale' as const
})

// 已选商品
const selectedItems = ref<OrderItemWithPrice[]>([])

// 收货信息
const receiverForm = reactive({
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  shippingFee: 0,
  discount: 0,
  remark: ''
})

// 表单验证
const receiverRules = {
  receiverName: { required: true, message: t('order.create.rules.receiverName'), trigger: 'blur' },
  receiverPhone: {
    required: true,
    pattern: /^1[3-9]\d{9}$/,
    message: t('order.create.rules.receiverPhone'),
    trigger: 'blur'
  },
  receiverAddress: { required: true, message: t('order.create.rules.receiverAddress'), trigger: 'blur' }
}

// 计算金额
const subtotal = computed(() => {
  return selectedItems.value.reduce((sum, item) => {
    return sum + (item.price || 0) * item.quantity
  }, 0)
})

const totalAmount = computed(() => {
  return subtotal.value + (receiverForm.shippingFee || 0) - (receiverForm.discount || 0)
})

// 加载商品列表
async function loadProducts() {
  productLoading.value = true
  try {
    const response = await getProductsApi({
      page: 1,
      pageSize: 100,
      keyword: productQuery.keyword || undefined,
      status: productQuery.status
    })
    console.log('商品列表响应:', response)
    products.value = response.data?.list || []

    if (products.value.length === 0) {
      message.warning(t('order.create.messages.noProductsAvailable'))
    }
  } catch (error) {
    console.error('加载商品失败:', error)
    message.error(resolveErrorMessage(error))
    products.value = []
  } finally {
    productLoading.value = false
  }
}

// 打开商品选择弹窗
function openProductModal() {
  productModalVisible.value = true
  loadProducts()
}

// 添加商品到订单
function addProduct(product: ProductItem) {
  const existing = selectedItems.value.find((item) => item.productId === product.id)

  if (existing) {
    existing.quantity++
  } else {
    selectedItems.value.push({
      productId: product.id,
      quantity: 1,
      price: Number(product.price)
    } as OrderItemWithPrice)
  }

  message.success(t('order.create.messages.productAdded'))
}

// 移除已选商品
function removeProduct(productId: string) {
  const index = selectedItems.value.findIndex((item) => item.productId === productId)

  if (index > -1) {
    selectedItems.value.splice(index, 1)
  }
}

// 更新商品数量
function updateQuantity(productId: string, quantity: number) {
  const item = selectedItems.value.find((item) => item.productId === productId)

  if (item) {
    item.quantity = quantity
  }
}

// 提交订单
async function handleSubmit() {
  if (selectedItems.value.length === 0) {
    message.error(t('order.create.messages.noProduct'))
    return
  }

  submitting.value = true

  try {
    const payload: CreateOrderPayload = {
      items: selectedItems.value.map(({ productId, skuId, quantity }) => ({ productId, skuId, quantity })),
      ...receiverForm
    }

    await createOrderApi(payload)
    message.success(t('order.create.messages.created'))
    router.push('/orders')
  } catch (error) {
    message.error(resolveErrorMessage(error))
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  // 初始化
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-950 dark:text-white">{{ t('order.create.title') }}</h1>
        <p class="text-sm text-slate-500">{{ t('order.create.description') }}</p>
      </div>
      <NSpace>
        <NButton @click="router.back()">{{ t('common.back') }}</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">{{ t('order.create.actions.submit') }}</NButton>
      </NSpace>
    </div>

    <!-- 商品选择 -->
    <NCard :title="t('order.create.sections.products')" class="!rounded-3xl" :bordered="false">
      <template #header-extra>
        <NButton type="primary" size="small" @click="openProductModal">{{ t('order.create.actions.addProduct') }}</NButton>
      </template>

      <NTable v-if="selectedItems.length > 0" :bordered="true" :single-line="false">
        <thead>
          <tr>
            <th>{{ t('order.columns.product') }}</th>
            <th>{{ t('order.columns.price') }}</th>
            <th>{{ t('order.columns.quantity') }}</th>
            <th>{{ t('order.columns.subtotal') }}</th>
            <th>{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in selectedItems" :key="item.productId">
            <td>{{ item.productId }}</td>
            <td>¥{{ (item.price || 0).toFixed(2) }}</td>
            <td>
              <NInputNumber v-model:value="item.quantity" :min="1" size="small" @update:value="(val) => updateQuantity(item.productId, val || 1)" />
            </td>
            <td>¥{{ ((item.price || 0) * item.quantity).toFixed(2) }}</td>
            <td>
              <NButton size="small" quaternary type="error" @click="removeProduct(item.productId)">
                {{ t('common.delete') }}
              </NButton>
            </td>
          </tr>
        </tbody>
      </NTable>

      <div v-else class="py-12 text-center text-slate-500">
        {{ t('order.create.messages.noProduct') }}
      </div>
    </NCard>

    <!-- 收货信息 -->
    <NCard :title="t('order.create.sections.receiver')" class="!rounded-3xl" :bordered="false">
      <NForm :model="receiverForm" :rules="receiverRules" label-placement="left" label-width="100">
        <NFormItem :label="t('order.columns.receiver')" path="receiverName">
          <NInput v-model:value="receiverForm.receiverName" :placeholder="t('order.create.placeholders.receiverName')" />
        </NFormItem>
        <NFormItem :label="t('order.columns.phone')" path="receiverPhone">
          <NInput v-model:value="receiverForm.receiverPhone" :placeholder="t('order.create.placeholders.receiverPhone')" />
        </NFormItem>
        <NFormItem :label="t('order.columns.address')" path="receiverAddress">
          <NInput v-model:value="receiverForm.receiverAddress" :placeholder="t('order.create.placeholders.receiverAddress')" type="textarea" />
        </NFormItem>
        <NFormItem :label="t('order.columns.shippingFee')">
          <NInputNumber v-model:value="receiverForm.shippingFee" :min="0" :precision="2" />
        </NFormItem>
        <NFormItem :label="t('order.columns.discount')">
          <NInputNumber v-model:value="receiverForm.discount" :min="0" :precision="2" />
        </NFormItem>
        <NFormItem :label="t('order.columns.remark')">
          <NInput v-model:value="receiverForm.remark" :placeholder="t('order.create.placeholders.remark')" type="textarea" />
        </NFormItem>
      </NForm>
    </NCard>

    <!-- 金额汇总 -->
    <NCard :title="t('order.create.sections.amount')" class="!rounded-3xl" :bordered="false">
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="text-slate-600">{{ t('order.columns.subtotal') }}</span>
          <span class="font-medium">¥{{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-600">{{ t('order.columns.shippingFee') }}</span>
          <span class="font-medium">¥{{ receiverForm.shippingFee.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-600">{{ t('order.columns.discount') }}</span>
          <span class="font-medium text-red-500">-¥{{ receiverForm.discount.toFixed(2) }}</span>
        </div>
        <div class="border-t border-slate-200 pt-2 dark:border-slate-700">
          <div class="flex justify-between">
            <span class="text-lg font-bold">{{ t('order.columns.totalAmount') }}</span>
            <span class="text-2xl font-bold text-red-500">¥{{ totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </NCard>

    <!-- 商品选择弹窗 -->
    <NModal v-model:show="productModalVisible" preset="card" :title="t('order.create.actions.addProduct')" class="max-w-4xl">
      <div class="mb-4">
        <NInput v-model:value="productQuery.keyword" :placeholder="t('order.searchPlaceholder')" clearable @keyup.enter="loadProducts" />
      </div>

      <NTable :loading="productLoading" :bordered="true" :single-line="false">
        <thead>
          <tr>
            <th>{{ t('product.columns.code') }}</th>
            <th>{{ t('product.columns.name') }}</th>
            <th>{{ t('product.columns.price') }}</th>
            <th>{{ t('product.columns.stock') }}</th>
            <th>{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.code }}</td>
            <td>{{ product.name }}</td>
            <td>¥{{ Number(product.price).toFixed(2) }}</td>
            <td>{{ product.stock }}</td>
            <td>
              <NButton size="small" type="primary" @click="addProduct(product)">{{ t('order.create.actions.select') }}</NButton>
            </td>
          </tr>
        </tbody>
      </NTable>
    </NModal>
  </div>
</template>
