<template>
  <el-dialog
      title="分配权限"
      :model-value="modelValue"
      :close-on-click-modal="false"
      destroy-on-close
      :before-close="close"
      width="50%"
  >
    <el-tree
        :data="rightsList"
        :default-checked-keys="defKeys"
        node-key="id"
        ref="treeRef"
        default-expand-all
        show-checkbox
        :props="treeProps">
    </el-tree>
    <template #footer>
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="allotRights">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { setRoleApi } from '@/apis/permission.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  rightsList: {
    type: Array,
    default: () => []
  },
  defKeys: {
    type: Array,
    default: () => []
  },
  roleId: {
    type: Number,
    default: 0
  }
})
const emits = defineEmits(['update:modelValue', 'clearDefKeys', 'getRightsList'])

const treeRef = ref()

const close = () => {
  emits('clearDefKeys')
  emits('update:modelValue', false)
}
const treeProps = {
  children: 'children',
  label: 'authName'
}

const allotRights = async () => {
  const keys = [
    ...treeRef.value.getCheckedKeys(),
    ...treeRef.value.getHalfCheckedKeys()
  ]
  const idStr = keys.join(',')
  await setRoleApi(props.roleId, { rids: idStr })
  ElMessage.success('权限分配成功')
  close()
  emits('getRightsList')
}
</script>

<style lang="scss" scoped>

</style>
