<script setup lang="ts">
import { CreateCategorySchema } from '@shop-saas/schemas'
import { NButton, NCard, NForm, NFormItem, NInput, NInputNumber, NModal, NSelect, NSpace, NTag, useMessage } from 'naive-ui'
import type { DataTableColumns, FormInst } from 'naive-ui'
import { computed, h, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DataTable from '@/components/DataTable.vue'
import { resolveErrorMessage } from '@/utils/error-message'
import { zodToNaiveRules } from '@/utils/zod-form'
import {
  createProductCategoryApi,
  deleteProductCategoryApi,
  getProductCategoriesApi,
  updateProductCategoryApi,
  type ProductCategoryItem
} from '../api'

const { t } = useI18n()
const message = useMessage()
const loading = ref(false)
const categories = ref<ProductCategoryItem[]>([])
const categoryModalVisible = ref(false)
const currentCategory = ref<ProductCategoryItem | null>(null)
const formRef = ref<FormInst | null>(null)

const categoryForm = reactive({
  name: '',
  parentId: undefined as string | undefined,
  sort: 0
})

// 🎯 直接用共享的 Zod Schema 生成 Naive UI 校验规则
const formRules = zodToNaiveRules(CreateCategorySchema)

const parentCategoryOptions = computed(() => [
  { label: t('product.rootCategory'), value: undefined },
  ...categories.value
    .filter((c) => c.id !== currentCategory.value?.id)
    .map((c) => ({ label: c.name, value: c.id }))
])

const columns = computed<DataTableColumns<ProductCategoryItem>>(() => [
  {
    title: t('product.columns.name'),
    key: 'name',
    width: 200
  },
  {
    title: t('product.columns.parent'),
    key: 'parentName',
    width: 150,
    render: (row) => {
      const parent = categories.value.find((c) => c.id === row.parentId)
      return parent ? h(NTag, { round: true, size: 'small', type: 'info' }, { default: () => parent.name }) : '-'
    }
  },
  {
    title: t('product.columns.sort'),
    key: 'sort',
    width: 80
  },
  {
    title: t('product.columns.children'),
    key: 'childrenCount',
    width: 80,
    render: (row) => {
      const count = categories.value.filter((c) => c.parentId === row.id).length
      return count > 0 ? h(NTag, { round: true, size: 'small', type: 'success' }, { default: () => String(count) }) : '0'
    }
  },
  {
    title: t('common.actions'),
    key: 'actions',
    width: 120,
    render: (row) =>
      h(NSpace, null, {
        default: () => [
          h(NButton, { size: 'small', quaternary: true, type: 'primary', onClick: () => openEditCategory(row) }, { default: () => t('product.actions.edit') }),
          h(NButton, { size: 'small', quaternary: true, type: 'error', onClick: () => removeCategory(row) }, { default: () => t('product.actions.delete') })
        ]
      })
  }
])

async function loadCategories() {
  loading.value = true

  try {
    const response = await getProductCategoriesApi()
    categories.value = response.data
  } catch (error) {
    message.error(resolveErrorMessage(error))
  } finally {
    loading.value = false
  }
}

function resetCategoryForm() {
  currentCategory.value = null
  categoryForm.name = ''
  categoryForm.parentId = undefined
  categoryForm.sort = 0
}

function openCreateCategory() {
  resetCategoryForm()
  categoryModalVisible.value = true
}

function openEditCategory(category: ProductCategoryItem) {
  currentCategory.value = category
  categoryForm.name = category.name
  categoryForm.parentId = category.parentId || undefined
  categoryForm.sort = category.sort
  categoryModalVisible.value = true
}

async function saveCategory() {
  // 先做表单校验
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  try {
    if (currentCategory.value) {
      await updateProductCategoryApi(currentCategory.value.id, categoryForm)
    } else {
      await createProductCategoryApi(categoryForm)
    }

    message.success(t('product.messages.categorySaved'))
    categoryModalVisible.value = false
    await loadCategories()
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

async function removeCategory(category: ProductCategoryItem) {
  try {
    await deleteProductCategoryApi(category.id)
    message.success(t('product.messages.categoryDeleted'))
    await loadCategories()
  } catch (error) {
    message.error(resolveErrorMessage(error))
  }
}

onMounted(loadCategories)
</script>

<template>
  <div class="space-y-6">

    <NCard class="!rounded-3xl" :bordered="false">
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm text-slate-500">
          {{ t('product.categoriesTip') }}
          <span v-if="categories.length > 0" class="ml-2 text-slate-400">· 共 {{ categories.length }} 条</span>
        </span>
        <NButton type="primary" @click="openCreateCategory">{{ t('product.actions.createCategory') }}</NButton>
      </div>
      <DataTable
        :loading="loading"
        :columns="columns"
        :data="categories"
        :pagination="false"
      />
    </NCard>

    <NModal v-model:show="categoryModalVisible" preset="card" :title="currentCategory ? t('product.actions.editCategory') : t('product.actions.createCategory')" class="max-w-md">
      <NForm ref="formRef" :model="categoryForm" :rules="formRules" label-placement="top">
        <NFormItem :label="t('product.columns.name')" path="name">
          <NInput v-model:value="categoryForm.name" />
        </NFormItem>
        <NFormItem :label="t('product.form.parent')" path="parentId">
          <NSelect v-model:value="categoryForm.parentId" :options="parentCategoryOptions" clearable />
        </NFormItem>
        <NFormItem :label="t('product.form.sort')" path="sort">
          <NInputNumber v-model:value="categoryForm.sort" :min="0" class="w-full" />
        </NFormItem>
      </NForm>
      <template #footer>
        <div class="flex justify-end gap-3">
          <NButton @click="categoryModalVisible = false">{{ t('access.actions.cancel') }}</NButton>
          <NButton type="primary" @click="saveCategory">{{ t('access.actions.save') }}</NButton>
        </div>
      </template>
    </NModal>
  </div>
</template>
