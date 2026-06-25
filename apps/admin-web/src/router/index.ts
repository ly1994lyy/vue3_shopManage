import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const AdminLayout = () => import('@/layouts/AdminLayout.vue')
const AuthLogin = () => import('@/modules/auth/pages/AuthLogin.vue')
const DashboardHome = () => import('@/modules/dashboard/pages/DashboardHome.vue')
const TenantOverview = () => import('@/modules/tenant/pages/TenantOverview.vue')
const AccessControl = () => import('@/modules/access/pages/AccessControl.vue')
const UserManagement = () => import('@/modules/user/pages/UserManagement.vue')
const ProductList = () => import('@/modules/product/pages/ProductList.vue')
const ProductCategory = () => import('@/modules/product/pages/ProductCategory.vue')
const OrderList = () => import('@/modules/order/pages/OrderList.vue')
const OrderDetail = () => import('@/modules/order/pages/OrderDetail.vue')
const OrderCreate = () => import('@/modules/order/pages/OrderCreate.vue')
const OperationLogPage = () => import('@/modules/audit/pages/OperationLogPage.vue')
const LoginLogPage = () => import('@/modules/audit/pages/LoginLogPage.vue')

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: AuthLogin,
      meta: { public: true }
    },
    {
      path: '/',
      component: AdminLayout,
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardHome,
          meta: { title: 'dashboard.title' }
        },
        {
          path: 'tenants',
          name: 'tenants',
          component: TenantOverview,
          meta: { title: 'tenant.title' }
        },
        {
          path: 'users',
          name: 'users',
          component: UserManagement,
          meta: { title: 'user.title' }
        },
        {
          path: 'access',
          name: 'access',
          component: AccessControl,
          meta: { title: 'access.title' }
        },
        {
          path: 'products',
          redirect: '/products/list'
        },
        {
          path: 'products/list',
          name: 'product-list',
          component: ProductList,
          meta: { title: 'product.listTitle' }
        },
        {
          path: 'products/categories',
          name: 'product-categories',
          component: ProductCategory,
          meta: { title: 'product.categoryTitle' }
        },
        {
          path: 'orders',
          name: 'orders',
          component: OrderList,
          meta: { title: 'order.title' }
        },
        {
          path: 'orders/:id',
          name: 'order-detail',
          component: OrderDetail,
          meta: { title: 'order.detail' }
        },
        {
          path: 'orders/create',
          name: 'order-create',
          component: OrderCreate,
          meta: { title: 'order.create.title' }
        },
        {
          path: 'audit/operations',
          name: 'audit-operations',
          component: OperationLogPage,
          meta: { title: 'audit.operation.title' }
        },
        {
          path: 'audit/logins',
          name: 'audit-logins',
          component: LoginLogPage,
          meta: { title: 'audit.login.title' }
        }
      ]
    }
  ]
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (!to.meta.public && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})
