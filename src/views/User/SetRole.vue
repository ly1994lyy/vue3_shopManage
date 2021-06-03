<template>
  <el-dialog
    title="分配角色"
    :model-value="setRoleDialogVisible"
    @close="setRoleDialogClosed"
    width="50%"
  >
    <div>
      <p>当前的用户:{{ userInfo.username }}</p>
      <p>当前的角色:{{ userInfo.role_name }}</p>
      <p>分配新角色:
        <el-select v-model="selectRoleId" placeholder="请选择新角色">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id">
          </el-option>
        </el-select>
      </p>
    </div>
    <template #footer>
      <el-button @click="setRoleDialogClosed">取 消</el-button>
      <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { getRoles, setRole } from '@/api/user'
import { ElMessage } from 'element-plus'

export default defineComponent({
  name: 'SetRole',
  props: {
    setRoleDialogVisible: {
      type: Boolean,
      default: false
    },
    userInfo: Object,
    id: String
  },
  setup: (props, context) => {
    const { emit } = context
    const rolesList = ref([])
    const selectRoleId = ref('')

    const getRoleList = async () => {
      const { data } = await getRoles()
      if (data.meta.status === 200) {
        rolesList.value = data.data
      }
    }

    const setRoleDialogClosed = () => {
      selectRoleId.value = ''
      emit('closeRoleDialog')
    }

    const saveRoleInfo = async () => {
      if (!selectRoleId.value) {
        ElMessage({
          type: 'error',
          message: '请选择要分配的角色!',
          showClose: true
        })
        return
      }
      const { data } = await setRole(String(props.id), { rid: selectRoleId.value })
      if (data.meta.status === 200) {
        ElMessage({
          type: 'success',
          message: data.meta.msg,
          showClose: true
        })
        setRoleDialogClosed()
      }
    }

    watch(() => props.setRoleDialogVisible, (newValue) => {
      if (newValue) {
        getRoleList()
      }
    })
    return {
      rolesList,
      selectRoleId,
      setRoleDialogClosed,
      saveRoleInfo
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
