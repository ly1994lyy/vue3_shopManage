<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  height?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const content = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const editorOptions = {
  theme: 'snow',
  placeholder: props.placeholder || '请输入内容...',
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ]
  }
}
</script>

<template>
  <div class="rich-editor-wrapper" :style="{ height: height ? `${height}px` : 'auto' }">
    <QuillEditor
      v-model:content="content"
      contentType="html"
      :options="editorOptions"
      class="rich-editor"
    />
  </div>
</template>

<style scoped>
.rich-editor-wrapper {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.rich-editor-wrapper :deep(.ql-toolbar) {
  border: none;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.rich-editor-wrapper :deep(.ql-container) {
  border: none;
  font-family: inherit;
  font-size: 14px;
}

.rich-editor-wrapper :deep(.ql-editor) {
  min-height: 200px;
}

.dark .rich-editor-wrapper {
  border-color: #374151;
}

.dark .rich-editor-wrapper :deep(.ql-toolbar) {
  border-color: #374151;
  background: #1f2937;
}

.dark .rich-editor-wrapper :deep(.ql-container) {
  border-color: #374151;
  background: #111827;
  color: #f3f4f6;
}
</style>
