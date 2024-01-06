<template>
  <el-dialog
      title="物流进度"
      :model-value="modelValue"
      width="50%"
      before-close="close">
    <el-timeline>
      <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time">
        {{ activity.context }}
      </el-timeline-item>
    </el-timeline>
    <template #footer>
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="close">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { getProgressInfoApi } from '@/apis/order.js'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['update:modelValue'])

const progressInfo = ref([])

const getProgressInfo = async () => {
  const res = await getProgressInfoApi()
  progressInfo.value = res.data
}

const close = () => {
  emits('update:modelValue', false)
}

getProgressInfo()
</script>

<style lang="scss" scoped>

</style>
