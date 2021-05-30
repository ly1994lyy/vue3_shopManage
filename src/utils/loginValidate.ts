import { reactive } from 'vue'

interface IUser{
  username:string,
  password:string
}

interface IRules{
  username: {
    required: boolean;
    message: string;
    trigger: string;
  }[];
  password: {
    required: boolean;
    message: string;
    trigger: string;
  }[];
}

export const loginForm = reactive<IUser>({
  username: 'admin',
  password: '123456'
})

export const LoginFormRules = reactive<IRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
})
