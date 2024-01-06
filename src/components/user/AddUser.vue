<template>
  <el-dialog
      :title="title"
      :model-value="modelValue"
      :close-on-click-modal="false"
      width="50%"
      destroy-on-close
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
          <el-button @click="$emit('update:modelValue',false)">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
    </template>
  </el-dialog>
</template>

<script setup>

import { addUserApi, getUser, updateUserApi } from '@/apis/user.js'
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: ''
  }
})

const emits = defineEmits(['update:modelValue', 'getUserList'])

const addUserForm = ref({
  username: '',
  password: '',
  email: '',
  mobile: ''
})

// 自定义邮箱校验规则
const checkEmail = (rule, value, cb) => {
  const regEmail = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
  if (regEmail.test(value)) {
    return cb()
  }
  cb(new Error('请输入合法的邮箱'))
}
// 自定义手机号校验规则
const checkMobile = (rule, value, cb) => {
  const regMobile = /^1[3,45678][0-9]{9}$/
  if (regMobile.test(value)) {
    return cb()
  }
  cb(new Error('请输入合法的手机号'))
}

const addUserFormRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      require: true,
      min: 3,
      max: 10,
      message: '用户名长度在 3 到 10 个字符',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      require: true,
      min: 6,
      max: 15,
      message: '密码长度在 6 到 15 个字符',
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: checkEmail, trigger: 'blur' }
  ],
  mobile: [
    { required: true, message: '请输入手机', trigger: 'blur' },
    { validator: checkMobile, trigger: 'blur' }
  ]
})

const addUserFormRef = ref(null)

const addUser = () => {
  addUserFormRef.value.validate(async (valid) => {
    if (valid) {
      let params = {}
      if (props.id) {
        params = {
          email: addUserForm.value.email,
          mobile: addUserForm.value.mobile
        }
        const res = await updateUserApi(props.id, params)
        ElMessage({
          type: 'success',
          message: res.meta.msg,
          showClose: true
        })
      } else {
        params = addUserForm.value
        const res = await addUserApi(params)

        ElMessage({
          type: 'success',
          message: res.meta.msg,
          showClose: true
        })
      }
      addUserFormRef.value.resetFields()
      emits('update:modelValue', false)
      emits('getUserList')
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

const title = computed(() => props.id ? '修改用户' : '新建用户')

getUserInfo()

</script>

<style lang="scss" scoped>

</style>
