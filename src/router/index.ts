import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/home',
    name: 'Home',
    redirect: '/welcome',
    component: Home,
    children: [
      {
        path: '/welcome',
        component: () => import('@/views/Welcome.vue')
      },
      {
        path: '/users',
        component: () => import('@/views/User/UserList.vue')
      },
      {
        path: '/roles',
        component: () => import('@/views/Permission/RoleList.vue')
      },
      {
        path: '/rights',
        component: () => import('@/views/Permission/RightList.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
