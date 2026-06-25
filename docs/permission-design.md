# 权限设计文档

> 版本：v0.1  
> 范围：平台后台与租户后台 RBAC 权限体系

## 1. 设计目标

权限体系需要支持：

- 平台级角色
- 租户级角色
- 菜单权限
- 页面权限
- 按钮权限
- API 权限
- 数据权限
- 多租户隔离

前端权限用于用户体验，后端权限才是安全边界。

## 2. 权限模型

基础模型：

```text
User
└── UserRole
    └── Role
        └── RolePermission
            └── Permission
```

## 3. 角色作用域

角色分为：

| 作用域 | 说明 |
| --- | --- |
| platform | 平台级角色，可跨租户 |
| tenant | 租户级角色，只在当前租户内生效 |

## 4. 平台级角色

第一阶段建议内置：

| 角色 | code | 说明 |
| --- | --- | --- |
| 平台超级管理员 | platform_super_admin | 拥有全部权限 |
| 平台运营 | platform_operator | 管理租户和平台运营数据 |
| 平台客服 | platform_support | 查看订单、售后、客户反馈 |

## 5. 租户级角色

第一阶段建议内置：

| 角色 | code | 说明 |
| --- | --- | --- |
| 租户管理员 | tenant_admin | 管理当前租户全部业务 |
| 商品运营 | product_operator | 管理商品、分类、库存 |
| 订单处理员 | order_operator | 处理订单、发货、售后 |
| 客服人员 | tenant_support | 处理客户咨询与售后 |

## 6. 权限类型

权限类型包括：

| 类型 | 说明 |
| --- | --- |
| menu | 菜单权限 |
| page | 页面访问权限 |
| button | 按钮操作权限 |
| api | 接口访问权限 |
| data | 数据范围权限 |

## 7. 权限编码规范

建议格式：

```text
业务域:资源:动作
```

示例：

```text
tenant:list:view
tenant:create:submit
product:list:view
product:create:submit
product:update:submit
order:list:view
order:ship:submit
system:role:assign
```

## 8. 前端权限策略

前端负责：

- 根据菜单权限生成侧边栏。
- 根据页面权限控制路由访问。
- 根据按钮权限控制按钮显示。
- 根据权限码封装 `PermissionButton`。

建议前端能力：

```ts
hasPermission('product:create:submit')
hasAnyPermission(['product:update:submit', 'product:delete:submit'])
hasRole('tenant_admin')
```

## 9. 后端权限策略

后端负责：

- JWT 鉴权。
- 用户状态校验。
- 租户状态校验。
- API 权限校验。
- 数据归属校验。

建议 NestJS 中使用：

- Guard：认证和权限校验。
- Decorator：声明接口权限。
- Interceptor：统一响应和日志。
- Pipe：参数校验。

示例：

```ts
@RequirePermissions('tenant:list:view')
@Get('tenants')
findTenants() {}
```

## 10. 数据权限

第一阶段数据权限规则：

| 用户类型 | 数据范围 |
| --- | --- |
| 平台超级管理员 | 全部数据 |
| 平台运营 | 授权平台数据 |
| 租户管理员 | 当前租户全部数据 |
| 租户员工 | 当前租户授权数据 |

后续可扩展：

- 当前部门数据
- 当前用户创建数据
- 指定店铺数据
- 自定义数据范围

## 11. 菜单与权限关系

菜单可以绑定 permission code。

前端菜单示例：

```ts
{
  title: '租户中枢',
  path: '/tenants',
  permission: 'tenant:list:view'
}
```

后端也可以返回动态菜单，第一阶段可以先使用前端静态菜单 + 权限过滤，后续再改为后端动态菜单。

## 12. 开发要求

- 所有敏感接口必须声明权限。
- 所有租户业务接口必须校验 tenantId。
- 前端隐藏按钮不是安全措施。
- 超级管理员权限也需要有审计日志。
- 权限变更必须记录操作日志。
