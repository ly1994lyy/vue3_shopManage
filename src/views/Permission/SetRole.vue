<template>
  <el-dialog
    title="分配权限"
    :model-value="setRightDialogVisible"
    :close-on-click-modal="false"
    @close="setRightDialogClosed"
    width="50%"
  >
    <el-tree
      :data="rightslist"
      :default-checked-keys="defKeys"
      node-key="id"
      ref="treeRef"
      default-expand-all
      show-checkbox
      :props="treeProps">
    </el-tree>
    <template #footer>
      <el-button @click="setRightDialogClosed">取 消</el-button>
      <el-button type="primary" @click="allotRights">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import { getRights, setRole } from '@/api/permission'
import { ElMessage } from 'element-plus'

export default defineComponent({
  name: 'AddRole',
  props: {
    setRightDialogVisible: {
      type: Boolean,
      default: false
    },
    id: String,
    rowData: Object
  },
  setup: (props, context) => {
    const { emit } = context
    const rightslist = ref([])
    const defKeys = ref([])
    const treeProps = ref({
      children: 'children',
      label: 'authName'
    })
    const treeRef = ref(null)

    const showSetRightDialog = async () => {
      const { data } = await getRights()
      if (data.meta.status === 200) {
        rightslist.value = data.data
        getLeafKeys(props.rowData)
      }
    }
    const setRightDialogClosed = () => {
      defKeys.value = []
      emit('closeSetRightDialog')
    }

    const allotRights = async () => {
      const keys = [
        ...treeRef.value.getCheckedKeys(),
        ...treeRef.value.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data } = await setRole(props.id, { rids: idStr })
      if (data.meta.status === 200) {
        ElMessage({
          type: 'success',
          message: data.meta.msg,
          showClose: true
        })
        emit('getRoleList')
        setRightDialogClosed()
      }
    }

    const getLeafKeys = (node) => {
      if (!node.children) {
        return defKeys.value.push(node.id)
      }
      node.children.forEach(item => getLeafKeys(item))
    }

    watch(() => props.setRightDialogVisible, (newValue) => {
      if (newValue) showSetRightDialog()
    })
    return {
      rightslist,
      defKeys,
      treeProps,
      treeRef,
      setRightDialogClosed,
      allotRights
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
