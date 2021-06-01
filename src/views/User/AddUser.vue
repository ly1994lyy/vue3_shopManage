<template>
  <el-dialog
    title="添加用户"
    :model-value="addDialogVisible"
    width="50%"
    @close="addDialogClosed"
  >
    <el-form
      :model="addUserForm"
      :rules="addUserFormRules"
      ref="addUserFormRef"
      label-width="70px"
      class="demo-ruleForm"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="addUserForm.username"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="addUserForm.password"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="addUserForm.email"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="addUserForm.mobile"></el-input>
      </el-form-item>
    </el-form>
    <template #footer >
        <span class="dialog-footer">
          <el-button @click="addDialogClosed">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { addUserForm, addUserFormRules } from '@/utils/userValidate'

export default defineComponent({
  name: 'AddUser',
  props: {
    addDialogVisible: {
      type: Boolean,
      default: false
    }
  },
  setup: (props, context) => {
    const addUserFormRef = ref(null)
    const { emit } = context
    const addDialogClosed = () => {
      emit('closeAddDialog')
    }
    const addUser = () => {
      return ''
    }
    return {
      addUserForm,
      addUserFormRules,
      addUserFormRef,
      addUser,
      addDialogClosed
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
