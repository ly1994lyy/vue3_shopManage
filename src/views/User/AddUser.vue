<template>
  <el-dialog
    :title="title"
    :model-value="addDialogVisible"
    :close-on-click-modal="false"
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
        <el-input :disabled="id!==''" v-model="addUserForm.username"></el-input>
      </el-form-item>
      <el-form-item v-if="!id" label="密码" prop="password">
        <el-input type="password" v-model="addUserForm.password"></el-input>
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
import { defineComponent, ref, computed, watch } from 'vue'
import { addUserForm, addUserFormRules } from '@/utils/userValidate'
import { addUserApi, getUser, updateUserApi } from '@/api/user'
import { ElMessage } from 'element-plus'

export default defineComponent({
  name: 'AddUser',
  props: {
    addDialogVisible: {
      type: Boolean,
      default: false
    },
    id: {
      type: String
    }
  },
  setup: (props, context) => {
    const addUserFormRef = ref(null)
    const { emit } = context
    const addDialogClosed = () => {
      (addUserFormRef.value as any).resetFields()
      emit('closeAddDialog')
    }
    const addUser = () => {
      (addUserFormRef.value as any).validate(async (valid:boolean) => {
        if (valid) {
          let params = {}
          if (props.id) {
            params = {
              email: addUserForm.value.email,
              mobile: addUserForm.value.mobile
            }
            const { data } = await updateUserApi(props.id, params)
            if (data.meta.status === 200) {
              ElMessage({
                type: 'success',
                message: data.meta.msg,
                showClose: true
              })
            }
          } else {
            params = addUserForm.value
            const { data } = await addUserApi(params)
            if (data.meta.status === 201) {
              ElMessage({
                type: 'success',
                message: data.meta.msg,
                showClose: true
              })
            }
          }
          (addUserFormRef.value as any).resetFields()
          emit('closeAddDialog')
          emit('getUserList')
        }
      })
    }

    const getUserInfo = async () => {
      if (props.id) {
        const { data } = await getUser(props.id)
        if (data.meta.status === 200) {
          addUserForm.value = data.data
        }
      }
    }

    const title = computed(():string => {
      if (props.id) {
        return '修改用户'
      } else {
        return '新建用户'
      }
    })

    watch(() => props.addDialogVisible, (newValue) => {
      if (newValue) {
        getUserInfo()
        addUserFormRules.value.password = []
      } else {
        emit('closeAddDialog')
        addUserFormRules.value.password = [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            require: true,
            min: 6,
            max: 15,
            message: '密码长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ]
      }
    })

    return {
      addUserForm,
      addUserFormRules,
      addUserFormRef,
      title,
      addUser,
      addDialogClosed
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
