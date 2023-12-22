import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    component: () => import('@/views/login.vue')
  },
  {
    path: '/',
    redirect: '/home',
    component: () => import('@/components/layout/Main.vue'),
    children: [
      {
        path: '/home',
        name: 'home',
        component: () => import('@/views/home/index.vue')
      },
      {
        path: '/users',
        name: 'users',
        component: () => import('@/views/user/list.vue')
      },
      {
        path: '/roles',
        name: 'roles',
        component: () => import('@/views/permission/roleList.vue')
      }
    ]
  }

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
