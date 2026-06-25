import { PrismaClient, PermissionType, RoleScope, UserType } from '@prisma/client'
import * as argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
  const permissions = [
    { name: '工作台查看', code: 'dashboard:view', type: PermissionType.page },
    { name: '租户列表查看', code: 'tenant:list:view', type: PermissionType.page },
    { name: '租户创建', code: 'tenant:create:submit', type: PermissionType.button },
    { name: '租户更新', code: 'tenant:update:submit', type: PermissionType.button },
    { name: '租户删除', code: 'tenant:delete:submit', type: PermissionType.button },
    { name: '租户管理员初始化', code: 'tenant:admin:init', type: PermissionType.button },
    { name: '用户列表查看', code: 'user:list:view', type: PermissionType.page },
    { name: '用户创建', code: 'user:create:submit', type: PermissionType.button },
    { name: '用户更新', code: 'user:update:submit', type: PermissionType.button },
    { name: '用户角色分配', code: 'user:role:assign', type: PermissionType.button },
    { name: '用户密码重置', code: 'user:password:reset', type: PermissionType.button },
    { name: '角色列表查看', code: 'role:list:view', type: PermissionType.page },
    { name: '角色创建', code: 'role:create:submit', type: PermissionType.button },
    { name: '角色更新', code: 'role:update:submit', type: PermissionType.button },
    { name: '角色权限分配', code: 'role:permission:assign', type: PermissionType.button },
    { name: '权限列表查看', code: 'permission:list:view', type: PermissionType.page },
    { name: '商品列表查看', code: 'product:list:view', type: PermissionType.page },
    { name: '商品创建', code: 'product:create:submit', type: PermissionType.button },
    { name: '商品更新', code: 'product:update:submit', type: PermissionType.button },
    { name: '商品删除', code: 'product:delete:submit', type: PermissionType.button },
    { name: '商品分类管理', code: 'product:category:submit', type: PermissionType.button },
    { name: '订单列表查看', code: 'order:list:view', type: PermissionType.page },
    { name: '订单创建', code: 'order:create:submit', type: PermissionType.button },
    { name: '订单更新', code: 'order:update:submit', type: PermissionType.button },
    { name: '订单发货', code: 'order:ship:submit', type: PermissionType.button },
    { name: '订单取消', code: 'order:cancel:submit', type: PermissionType.button },
    { name: '操作日志查看', code: 'audit:operation:view', type: PermissionType.page },
    { name: '登录日志查看', code: 'audit:login:view', type: PermissionType.page },
    { name: '日志清理', code: 'audit:cleanup:submit', type: PermissionType.button }
  ]

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: permission,
      create: permission
    })
  }

  const existedPlatformRole = await prisma.role.findFirst({
    where: {
      tenantId: null,
      code: 'platform_super_admin'
    }
  })

  const platformRole = existedPlatformRole
    ? await prisma.role.update({
        where: { id: existedPlatformRole.id },
        data: {
          name: '平台超级管理员',
          scope: RoleScope.platform
        }
      })
    : await prisma.role.create({
        data: {
          name: '平台超级管理员',
          code: 'platform_super_admin',
          scope: RoleScope.platform
        }
      })

  const allPermissions = await prisma.permission.findMany()

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: platformRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: platformRole.id,
        permissionId: permission.id
      }
    })
  }

  const admin = await prisma.user.upsert({
    where: { account: 'admin' },
    update: {
      name: '平台管理员',
      type: UserType.platform
    },
    create: {
      account: 'admin',
      password: await argon2.hash('123456'),
      name: '平台管理员',
      type: UserType.platform
    }
  })

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: platformRole.id
      }
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: platformRole.id
    }
  })

  const demoTenant = await prisma.tenant.upsert({
    where: { code: 'star-market' },
    update: {
      name: '星河优选',
      status: 'active',
      contact: '林一',
      phone: '13800000000',
      plan: 'growth'
    },
    create: {
      name: '星河优选',
      code: 'star-market',
      status: 'active',
      contact: '林一',
      phone: '13800000000',
      plan: 'growth'
    }
  })

  const existedTenantRole = await prisma.role.findFirst({
    where: {
      tenantId: demoTenant.id,
      code: 'tenant_admin'
    }
  })

  const tenantRole = existedTenantRole
    ? await prisma.role.update({
        where: { id: existedTenantRole.id },
        data: {
          name: '租户管理员',
          scope: RoleScope.tenant
        }
      })
    : await prisma.role.create({
        data: {
          tenantId: demoTenant.id,
          name: '租户管理员',
          code: 'tenant_admin',
          scope: RoleScope.tenant
        }
      })

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: tenantRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: tenantRole.id,
        permissionId: permission.id
      }
    })
  }

  const tenantAdmin = await prisma.user.upsert({
    where: { account: 'tenant_admin' },
    update: {
      tenantId: demoTenant.id,
      name: '租户管理员',
      type: UserType.tenant
    },
    create: {
      tenantId: demoTenant.id,
      account: 'tenant_admin',
      password: await argon2.hash('123456'),
      name: '租户管理员',
      type: UserType.tenant
    }
  })

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: tenantAdmin.id,
        roleId: tenantRole.id
      }
    },
    update: {},
    create: {
      userId: tenantAdmin.id,
      roleId: tenantRole.id
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
