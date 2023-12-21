<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img src="../assets/vue.svg" alt="">
      </div>
      <!-- 表单 -->
      <el-form ref="LoginFormRef" :model="loginForm" label-width="0" :rules="LoginFormRules" class="login_form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="submit">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive } from 'vue'
import { loginApi } from '@/apis/auth.js'
import useHttp from '@/hooks/useHttp.js'

const LoginFormRef = ref(null)
const router = useRouter()

const { queryData, resInfo } = useHttp(loginApi, true)

const loginForm = reactive({
  username: 'admin',
  password: '123456'
})

const LoginFormRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
})

const login = async () => {
  await queryData(loginForm)
  if (resInfo.value.meta.status === 200) {
    ElMessage({
      showClose: true,
      message: '登录成功',
      type: 'success'
    })
    window.sessionStorage.setItem('token', resInfo.value.data.token)
    await router.push('/home')
  }
}

const submit = () => {
  LoginFormRef.value.validate(valid => {
    if (valid) {
      login()
    }
  })
}

const resetLoginForm = () => {
  LoginFormRef.value.resetFields()
}

</script>

<style lang="scss" scoped>
.login_container{
  background-color: #2b4b6b;
  height: 100%;
}
.login_box{
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%)
}
.avatar_box{
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left:50%;
  transform: translate(-50%,-50%);
  background-color: #fff;
  img{
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.login_form{
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}
.btns{
  display: flex;
  justify-content:flex-end;
}
</style>
