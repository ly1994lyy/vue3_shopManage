<script setup lang="ts">
import { NDataTable, NSpin } from 'naive-ui'
import type { DataTableColumns, PaginationProps } from 'naive-ui'
import { computed, ref, watch } from 'vue'

const emit = defineEmits<{
  (e: 'change', page: number, pageSize?: number): void
}>()

const props = withDefaults(defineProps<{
  columns: DataTableColumns<any>
  data: any[]
  loading?: boolean
  pagination?: PaginationProps | false
  rowKey?: (row: any) => string
  scrollX?: number
}>(), {
  loading: false,
  rowKey: (row: any) => row.id
})

const defaultPagination = {
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  prefix: ({ itemCount }: { itemCount: number | undefined }) => `共 ${itemCount ?? 0} 条`
}

const pagination = ref<PaginationProps | false>(false)
const paginationKey = ref(0)

watch(() => props.pagination, (newVal) => {
  if (newVal === false || newVal === undefined) {
    pagination.value = false
    return
  }

  const merged: PaginationProps = {
    ...defaultPagination,
    ...newVal
  }

  // itemCount 变化时递增 key，强制 NDataTable 重新渲染分页
  if (newVal.itemCount !== undefined) {
    merged.itemCount = newVal.itemCount
    paginationKey.value++
  }

  // 监听每页数量变化，重置到第一页并通知父组件
  merged.onUpdatePageSize = (pageSize: number) => {
    emit('change', 1, pageSize)
  }

  pagination.value = merged
}, { immediate: true, deep: true })

const rowKeyFn = computed(() => props.rowKey)
</script>

<template>
  <div class="data-table-wrapper">
    <NSpin :show="loading">
      <NDataTable
        :columns="columns"
        :data="data"
        :pagination="pagination"
        :row-key="rowKeyFn"
        :scroll-x="scrollX"
        :bordered="false"
        :remote="true"
        striped
      />
    </NSpin>
  </div>
</template>

<style scoped>
.data-table-wrapper {
  position: relative;
}
</style>
