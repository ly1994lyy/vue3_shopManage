<script setup lang="ts">
import { NButton, NForm, NFormItem, NInput, NSelect, NSpace } from 'naive-ui'
import { reactive, watch } from 'vue'

export interface SearchField {
  key: string
  label: string
  type?: 'input' | 'select'
  placeholder?: string
  options?: Array<{ label: string; value: string | number | undefined }>
  width?: string
}

const props = defineProps<{
  fields: SearchField[]
  modelValue: Record<string, any>
  loading?: boolean
  searchLabel?: string
  resetLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  search: []
  reset: []
}>()

// 使用本地 reactive 对象存储表单数据
const formData = reactive<Record<string, any>>({})

// 监听 modelValue 变化，同步到本地 formData
watch(
  () => props.modelValue,
  (val) => {
    Object.keys(val).forEach((key) => {
      formData[key] = val[key]
    })
  },
  { immediate: true, deep: true }
)

function handleSearch() {
  emit('update:modelValue', { ...formData })
  emit('search')
}

function handleReset() {
  // 重置所有字段为空值
  const resetData: Record<string, any> = {}

  props.fields.forEach((field) => {
    resetData[field.key] = undefined
    formData[field.key] = undefined
  })

  emit('update:modelValue', resetData)
  emit('reset')
}
</script>

<template>
  <div class="search-form-container">
    <NForm :model="formData" inline label-placement="left" class="search-form">
      <NSpace :size="12" wrap>
        <NFormItem
          v-for="field in fields"
          :key="field.key"
          :label="field.label"
          :show-feedback="false"
        >
          <NInput
            v-if="field.type !== 'select'"
            v-model:value="formData[field.key]"
            :placeholder="field.placeholder"
            clearable
            :style="{ width: field.width || '200px' }"
            @keyup.enter="handleSearch"
          />
          <NSelect
            v-else
            v-model:value="formData[field.key]"
            :options="field.options || []"
            :placeholder="field.placeholder"
            clearable
            :style="{ width: field.width || '200px' }"
          />
        </NFormItem>

        <NFormItem :show-feedback="false">
          <NSpace :size="8">
            <NButton :loading="loading" type="info" @click="handleSearch">
              {{ searchLabel || '搜索' }}
            </NButton>
            <NButton @click="handleReset">
              {{ resetLabel || '重置' }}
            </NButton>
            <slot name="actions" />
          </NSpace>
        </NFormItem>
      </NSpace>
    </NForm>
  </div>
</template>

<style scoped>
.search-form-container {
  display: flex;
  justify-content: flex-start;
  padding: 0 0 16px 0;
}

.search-form :deep(.n-form-item) {
  margin-bottom: 0;
}
</style>
