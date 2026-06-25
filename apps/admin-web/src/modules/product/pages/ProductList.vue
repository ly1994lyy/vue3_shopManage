<script setup lang="ts">
import { CreateProductSchema } from '@shop-saas/schemas'
import { NButton, NCard, NForm, NFormItem, NInput, NInputNumber, NModal, NSelect, NSpace, NTag, useMessage } from 'naive-ui'
import type { FormInst } from 'naive-ui'
import { computed, h, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DataTable from '@/components/DataTable.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import RichEditor from '@/components/RichEditor.vue'
import SearchForm from '@/components/SearchForm.vue'
import { resolveErrorMessage } from '@/utils/error-message'
import { zodToNaiveRules } from '@/utils/zod-form'
import {
  createProductApi,
  deleteProductApi,
  getProductCategoriesApi,
  getProductsApi,
  updateProductApi,
  type CreateProductPayload,
  type ProductCategoryItem,
  type ProductItem,
  type ProductStatus
} from '../api'

const { t } = useI18n()
const message = useMessage()
const loading = ref(false)
const products = ref<ProductItem[]>([])
const categories = ref<ProductCategoryItem[]>([])
const total = ref(0)
const productModalVisible = ref(false)
const currentProduct = ref<ProductItem | null>(null)
const formRef = ref<FormInst | null>(null)

const query = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  status: undefined as ProductStatus | undefined,
  categoryId: undefined as string | undefined
})

const productForm = reactive<CreateProductPayload & { costPrice?: number; weight?: number; images?: string[] }>({
  name: '',
  code: '',
  categoryId: undefined,
  brief: '',
  description: '',
  price: 0,
  costPrice: 0,
  weight: 0,
  stock: 0,
  cover: '',
  images: [],
  status: 'draft'
})

// 🎯 用共享的 Zod Schema 生成 Naive UI 表单校验规则
const formRules = zodToNaiveRules(CreateProductSchema, {
  name: { trigger: 'blur' },
  code: { trigger: 'blur' },
  price: { trigger: 'blur' },
  stock: { trigger: 'blur' }
})

const statusOptions = computed(() => [
  { label: t('product.status.draft'), value: 'draft' },
  { label: t('product.status.on_sale'), value: 'on_sale' },
  { label: t('product.status.off_sale'), value: 'off_sale' },
  { label: t('product.status.archived'), value: 'archived' }
])

const categoryOptions = computed(() => [
  { label: t('product.allCategories'), value: undefined },
  ...categories.value.map((c) => ({ label: c.name, value: c.id }))
])

const formCategoryOptions = computed(() =>
  categories.value.map((c) => ({ label: c.name, value: c.id }))
)

const searchFields = computed(() => [
  {
    key: 'keyword',
    label: '',
    type: 'input' as const,
    placeholder: t('product.searchPlaceholder'),
    width: '220px'
  },
  {
    key: 'categoryId',
    label: '',
    type: 'select' as const,
    placeholder: '请选择分类',
    options: categoryOptions.value,
    width: '160px'
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

const statusTone: Record<ProductStatus, 'success' | 'warning' | 'info' | 'default'> = {
  on_sale: 'success',
  off_sale: 'warning',
  draft: 'info',
  archived: 'default'
}

const columns = computed(() => [
  {
    title: t('product.columns.cover'),
    key: 'cover',
    width: 80,
    render: (row: ProductItem) =>
      row.cover
        ? h('img', { src: row.cover, class: 'h-10 w-10 rounded-lg object-cover' })
        : h('div', { class: 'h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800' })
  },
  { title: t('product.columns.name'), key: 'name' },
  { title: t('product.columns.code'), key: 'code' },
  {
    title: t('product.columns.category'),
    key: 'category',
    render: (row: ProductItem) => row.category?.name || '-'
  },
  {
    title: t('product.columns.price'),
    key: 'price',
    render: (row: ProductItem) => `¥${Number(row.price).toFixed(2)}`
  },
  { title: t('product.columns.stock'), key: 'stock' },
  {
    title: t('product.columns.status'),
    key: 'status',
    render: (row: ProductItem) =>
      h(NTag, { round: true, type: statusTone[row.status] }, { default: () => t(`product.status.${row.status}`) })
  },
  {
    title: t('common.actions'),
    key: 'actions',
    render: (row: ProductItem) =>
      h(NSpace, null, {
        default: () => [
          h(NButton, { size: 'small', quaternary: true, type: 'primary', onClick: () => openEditProduct(row) }, { default: () => t('product.actions.edit') }),
          h(NButton, { size: 'small', quaternary: true, type: 'error', onClick: () => removeProduct(row) }, { default: () => t('product.actions.delete') })
        ]
      })
  }
])

async function loadCategories() {
  try {
    const response = await getProductCategoriesApi()
    categories.value = response.data
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

async function loadProducts() {
  loading.value = true

  try {
    const response = await getProductsApi(query)
    products.value = response.data.list
    total.value = response.data.pagination.total
  } catch (error) {
    message.error(resolveErrorMessage(error))
  } finally {
    loading.value = false
  }
}

function resetProductForm() {
  currentProduct.value = null
  productForm.name = ''
  productForm.code = ''
  productForm.categoryId = undefined
  productForm.brief = ''
  productForm.price = 0
  productForm.stock = 0
  productForm.status = 'draft'
}

function openCreateProduct() {
  resetProductForm()
  productModalVisible.value = true
}

function openEditProduct(product: ProductItem) {
  currentProduct.value = product
  productForm.name = product.name
  productForm.code = product.code
  productForm.categoryId = product.categoryId || undefined
  productForm.brief = product.brief || ''
  productForm.description = product.description || ''
  productForm.price = Number(product.price)
  productForm.costPrice = Number(product.costPrice) || 0
  productForm.weight = Number(product.weight) || 0
  productForm.stock = product.stock
  productForm.cover = product.cover || ''
  productForm.images = product.images || []
  productForm.status = product.status
  productModalVisible.value = true
}

async function saveProduct() {
  // 先做表单校验
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  try {
    const payload = {
      name: productForm.name,
      code: productForm.code,
      categoryId: productForm.categoryId,
      brief: productForm.brief,
      description: productForm.description,
      price: productForm.price,
      costPrice: productForm.costPrice,
      weight: productForm.weight,
      stock: productForm.stock,
      cover: productForm.cover,
      images: productForm.images,
      status: productForm.status
    }

    if (currentProduct.value) {
      await updateProductApi(currentProduct.value.id, payload)
    } else {
      await createProductApi(payload)
    }

    message.success(t('product.messages.saved'))
    productModalVisible.value = false
    await loadProducts()
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

async function removeProduct(product: ProductItem) {
  try {
    await deleteProductApi(product.id)
    message.success(t('product.messages.deleted'))
    await loadProducts()
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

function handleSearch() {
  query.page = 1
  loadProducts()
}

function handleReset() {
  query.page = 1
  loadProducts()
}

onMounted(() => {
  loadCategories()
  loadProducts()
})
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
          <NButton type="primary" @click="openCreateProduct">{{ t('product.actions.create') }}</NButton>
        </template>
      </SearchForm>
      <DataTable
        :loading="loading"
        :columns="columns"
        :data="products"
        :pagination="{
          page: query.page,
          pageSize: query.pageSize,
          itemCount: total,
          onChange: (page: number) => { query.page = page; loadProducts() }
        }"
        @change="(page: number, pageSize?: number) => { query.page = page; if (pageSize) query.pageSize = pageSize; loadProducts() }"
      />
    </NCard>

    <NModal v-model:show="productModalVisible" preset="card" :title="currentProduct ? t('product.actions.edit') : t('product.actions.create')" class="max-w-3xl">
      <NForm ref="formRef" :model="productForm" :rules="formRules" label-placement="top">
        <div class="grid grid-cols-2 gap-4">
          <NFormItem :label="t('product.columns.name')" path="name">
            <NInput v-model:value="productForm.name" />
          </NFormItem>
          <NFormItem :label="t('product.columns.code')" path="code">
            <NInput v-model:value="productForm.code" :disabled="Boolean(currentProduct)" />
          </NFormItem>
        </div>
        <NFormItem :label="t('product.columns.category')" path="categoryId">
          <NSelect v-model:value="productForm.categoryId" :options="formCategoryOptions" clearable />
        </NFormItem>
        <NFormItem :label="t('product.form.brief')" path="brief">
          <NInput v-model:value="productForm.brief" type="textarea" />
        </NFormItem>
        <NFormItem :label="t('product.form.description')" path="description">
          <RichEditor v-model="productForm.description!" :height="300" />
        </NFormItem>
        <div class="grid grid-cols-3 gap-4">
          <NFormItem :label="t('product.columns.price')" path="price">
            <NInputNumber v-model:value="productForm.price" :min="0" :precision="2" class="w-full" />
          </NFormItem>
          <NFormItem :label="t('product.form.costPrice')" path="costPrice">
            <NInputNumber v-model:value="productForm.costPrice" :min="0" :precision="2" class="w-full" />
          </NFormItem>
          <NFormItem :label="t('product.columns.stock')" path="stock">
            <NInputNumber v-model:value="productForm.stock" :min="0" class="w-full" />
          </NFormItem>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <NFormItem :label="t('product.form.weight')" path="weight">
            <NInputNumber v-model:value="productForm.weight" :min="0" :precision="3" class="w-full" />
          </NFormItem>
          <NFormItem :label="t('product.columns.status')" path="status">
            <NSelect v-model:value="productForm.status" :options="statusOptions" />
          </NFormItem>
        </div>
        <NFormItem :label="t('product.form.cover')" path="cover">
          <NInput v-model:value="productForm.cover" placeholder="https://..." />
        </NFormItem>
        <NFormItem :label="t('product.form.images')" path="images">
          <ImageUpload v-model="productForm.images!" :max="10" listType="image" />
        </NFormItem>
      </NForm>
      <template #footer>
        <div class="flex justify-end gap-3">
          <NButton @click="productModalVisible = false">{{ t('access.actions.cancel') }}</NButton>
          <NButton type="primary" @click="saveProduct">{{ t('access.actions.save') }}</NButton>
        </div>
      </template>
    </NModal>
  </div>
</template>
