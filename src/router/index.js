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
      },
      {
        path: '/rights',
        name: 'rights',
        component: () => import('@/views/permission/rightList.vue')
      },
      {
        path: '/goods',
        name: 'goods',
        component: () => import('@/views/good/list.vue')
      },
      {
        path: '/params',
        name: 'params',
        component: () => import('@/views/good/params.vue')
      }
    ]
  }

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
