export type PermissionCode =
  | 'dashboard:view'
  | 'tenant:list:view'
  | 'tenant:create:submit'
  | 'tenant:update:submit'
  | 'tenant:admin:init'
  | 'product:list:view'
  | 'product:create:submit'
  | 'product:update:submit'
  | 'product:delete:submit'
  | 'product:category:submit'
  | 'order:list:view'
  | 'order:create:submit'
  | 'order:update:submit'
  | 'order:ship:submit'
  | 'order:cancel:submit'
  | 'user:list:view'
  | 'user:create:submit'
  | 'user:update:submit'
  | 'user:role:assign'
  | 'user:password:reset'
  | 'role:list:view'
  | 'permission:list:view'
  | 'audit:operation:view'
  | 'audit:login:view'
  | 'audit:cleanup:submit'
  | 'system:setting:view'

/**
 * 菜单图标名联合。
 * 加新菜单时，在这里加一个 key，然后 AdminLayout.vue 的 iconMap
 * 必须实现这个 key —— 否则 TS 会立刻报错，避免再次出现"图标空白 + Vue warn"
 */
export type MenuIconName =
  | 'analytics'
  | 'apps'
  | 'bag'
  | 'business'
  | 'document-text'
  | 'people'
  | 'settings'

export interface AppMenuItem {
  key: string
  titleKey: string
  path?: string
  icon: MenuIconName
  permission: PermissionCode
  children?: AppMenuItem[]
}

export const appMenus: AppMenuItem[] = [
  {
    key: 'dashboard',
    titleKey: 'nav.dashboard',
    path: '/dashboard',
    icon: 'analytics',
    permission: 'dashboard:view'
  },
  {
    key: 'tenants',
    titleKey: 'nav.tenants',
    path: '/tenants',
    icon: 'business',
    permission: 'tenant:list:view'
  },
  {
    key: 'products',
    titleKey: 'nav.products',
    icon: 'bag',
    permission: 'product:list:view',
    children: [
      {
        key: 'products-list',
        titleKey: 'nav.productList',
        path: '/products/list',
        icon: 'bag',
        permission: 'product:list:view'
      },
      {
        key: 'products-categories',
        titleKey: 'nav.productCategories',
        path: '/products/categories',
        icon: 'bag',
        permission: 'product:list:view'
      }
    ]
  },
  {
    key: 'orders',
    titleKey: 'nav.orders',
    icon: 'apps',
    permission: 'order:list:view',
    children: [
      {
        key: 'orders-list',
        titleKey: 'nav.orderList',
        path: '/orders',
        icon: 'apps',
        permission: 'order:list:view'
      }
    ]
  },
  {
    key: 'members',
    titleKey: 'nav.members',
    path: '/users',
    icon: 'people',
    permission: 'user:list:view'
  },
  {
    key: 'access',
    titleKey: 'nav.access',
    path: '/access',
    icon: 'people',
    permission: 'role:list:view'
  },
  {
    key: 'audit',
    titleKey: 'nav.audit',
    icon: 'document-text',
    permission: 'audit:operation:view',
    children: [
      {
        key: 'audit-operations',
        titleKey: 'nav.auditOperations',
        path: '/audit/operations',
        icon: 'document-text',
        permission: 'audit:operation:view'
      },
      {
        key: 'audit-logins',
        titleKey: 'nav.auditLogins',
        path: '/audit/logins',
        icon: 'document-text',
        permission: 'audit:login:view'
      }
    ]
  },
  {
    key: 'settings',
    titleKey: 'nav.settings',
    icon: 'settings',
    permission: 'system:setting:view'
  }
]
