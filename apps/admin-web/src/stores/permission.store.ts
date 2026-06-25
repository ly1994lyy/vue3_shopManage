import { defineStore } from 'pinia'
import { appMenus, type AppMenuItem, type PermissionCode } from '@/router/menus'

/**
 * 兜底权限：登录前未拿到后端返回时使用。
 * 登录成功后会被 `setPermissions(user.permissions)` 完全覆盖。
 */
const initialPermissions: PermissionCode[] = [
  'dashboard:view',
  'tenant:list:view',
  'tenant:create:submit',
  'tenant:update:submit',
  'tenant:admin:init',
  'product:list:view',
  'product:create:submit',
  'product:update:submit',
  'product:delete:submit',
  'product:category:submit',
  'order:list:view',
  'order:create:submit',
  'order:update:submit',
  'order:ship:submit',
  'order:cancel:submit',
  'user:list:view',
  'user:create:submit',
  'user:update:submit',
  'user:role:assign',
  'user:password:reset',
  'role:list:view',
  'permission:list:view',
  'audit:operation:view',
  'audit:login:view',
  'audit:cleanup:submit',
  'system:setting:view'
]

function filterMenus(menus: AppMenuItem[], permissions: PermissionCode[]): AppMenuItem[] {
  return menus
    .map((menu) => {
      if (!permissions.includes(menu.permission)) {
        return null
      }

      if (menu.children?.length) {
        const children = filterMenus(menu.children, permissions)

        if (!children.length) {
          return null
        }

        return { ...menu, children }
      }

      return menu
    })
    .filter((menu): menu is AppMenuItem => menu !== null)
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    permissions: initialPermissions as PermissionCode[]
  }),
  getters: {
    menus: (state) => filterMenus(appMenus, state.permissions),
    hasPermission: (state) => (permission: PermissionCode) => state.permissions.includes(permission),
    hasAnyPermission: (state) => (permissions: PermissionCode[]) =>
      permissions.some((permission) => state.permissions.includes(permission))
  },
  actions: {
    setPermissions(permissions: string[] | undefined | null) {
      this.permissions = (permissions || []) as PermissionCode[]
    },
    reset() {
      this.permissions = initialPermissions
    }
  }
})
