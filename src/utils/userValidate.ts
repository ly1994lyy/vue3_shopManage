import { ref } from 'vue'

// 自定义邮箱校验规则
const checkEmail = (rule:any, value:any, cb:any) => {
  const regEail = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
  if (regEail.test(value)) {
    return cb()
  }
  cb(new Error('请输入合法的邮箱'))
}
// 自定义手机号校验规则
const checkMobile = (rule:any, value:any, cb:any) => {
  const regMobile = /^[1][3,4,5,7,8][0-9]{9}$/
  if (regMobile.test(value)) {
    return cb()
  }
  cb(new Error('请输入合法的手机号'))
}

export const addUserForm = ref({
  username: '',
  password: '',
  email: '',
  mobile: ''
})

export const addUserFormRules = ref({
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
