<template>
  <!-- 分配角色对话框 -->
  <el-dialog
      title="分配角色"
      :model-value="modelValue"
      :before-close="close"
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
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="saveRoleInfo"
      >确 定</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { setRole } from '@/apis/user.js'
import { getRoles } from '@/apis/permission.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  userInfo: {
    type: Object,
    Object,
    default: () => {}
  }
})

const emits = defineEmits(['update:modelValue', 'getUserList'])

const rolesList = ref([])
const selectRoleId = ref('')
const close = () => {
  emits('update:modelValue', false)
}

const getRolesList = async () => {
  const res = await getRoles()
  rolesList.value = res.data
}

const saveRoleInfo = async () => {
  if (!selectRoleId.value) {
    return ElMessage.error('请选择要分配的角色！')
  }
  await setRole(props.userInfo.id, { rid: selectRoleId.value })
  close()
  emits('getUserList')
  ElMessage.success('分配角色成功！')
}

getRolesList()
</script>

<style lang="scss" scoped>

</style>
