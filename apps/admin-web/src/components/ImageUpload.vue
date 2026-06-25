<script setup lang="ts">
import { NButton, NImage, NUpload, type UploadFileInfo } from 'naive-ui'
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string[]
  max?: number
  listType?: 'text' | 'image' | 'card'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const handleUpload = ({ file }: { file: UploadFileInfo }) => {
  // 这里应该是实际上传逻辑，目前先用 URL 模拟
  // 实际使用时需要调用后端上传接口
  const url = URL.createObjectURL(file.file as File)

  const newValue = [...props.modelValue, url]
  emit('update:modelValue', newValue)

  return false
}

const handleRemove = (index: number) => {
  const newValue = [...props.modelValue]
  newValue.splice(index, 1)
  emit('update:modelValue', newValue)
}

const canUpload = computed(() => {
  return !props.max || props.modelValue.length < props.max
})
</script>

<template>
  <div class="image-upload-wrapper">
    <div class="image-list" :class="listType">
      <div v-for="(img, idx) in modelValue" :key="idx" class="image-item">
        <NImage :src="img" width="100" />
        <div class="image-actions">
          <NButton size="tiny" type="error" @click="handleRemove(idx)">删除</NButton>
        </div>
      </div>
    </div>
    <NUpload
      v-if="canUpload"
      :custom-request="handleUpload"
      :show-file-list="false"
      accept="image/*"
    >
      <NButton dashed>+ 上传图片</NButton>
    </NUpload>
  </div>
</template>

<style scoped>
.image-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px;
  display: flex;
  justify-content: center;
}
</style>
