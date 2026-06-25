# 数据库设计文档

> 版本：v0.1  
> 范围：商城 SaaS 重构第一阶段核心数据模型  
> 数据库：MySQL  
> ORM：Prisma

## 1. 设计目标

数据库设计需要支持：

- 多租户数据隔离
- 多角色权限控制
- 平台用户与租户用户区分
- 商品、订单、库存等商城核心业务扩展
- 操作审计与登录日志
- 后续套餐、计费、多端、AI 能力扩展

## 2. 多租户隔离策略

第一阶段采用：

```text
共享数据库 + 共享表 + tenant_id 字段隔离
```

要求：

- 租户业务数据必须包含 `tenant_id`。
- 平台级数据可以不绑定租户。
- 租户用户访问数据时，后端必须自动追加 `tenant_id` 条件。
- 所有修改、删除操作必须校验数据归属。
- 操作日志、登录日志需要记录租户上下文。

## 3. 基础字段规范

大部分业务表建议包含：

| 字段 | 说明 |
| --- | --- |
| id | 主键，建议使用 cuid/uuid |
| tenant_id | 租户 ID，租户业务表必填 |
| created_at | 创建时间 |
| updated_at | 更新时间 |
| deleted_at | 软删除时间，可选 |
| created_by | 创建人，可选 |
| updated_by | 更新人，可选 |

## 4. 核心表分组

### 4.1 租户相关

- tenants
- tenant_settings
- tenant_packages
- tenant_package_limits

### 4.2 用户与权限相关

- users
- roles
- permissions
- user_roles
- role_permissions
- menus

### 4.3 商品相关

- product_categories
- products
- product_skus
- product_images
- product_attributes
- product_stock_logs

### 4.4 订单相关

- orders
- order_items
- order_payments
- order_deliveries
- order_refunds
- order_logs

### 4.5 会员与客户相关

- customers
- customer_addresses
- member_levels
- member_points

### 4.6 系统与审计相关

- operation_logs
- login_logs
- upload_files
- notifications
- system_configs

## 5. 第一阶段最小模型

第一阶段优先落地以下模型：

- Tenant
- User
- Role
- Permission
- UserRole
- RolePermission
- OperationLog
- LoginLog

商品、订单、库存等模型在权限和租户体系稳定后继续补充。

## 6. Prisma 命名约定

Prisma model 使用 PascalCase：

```prisma
model Tenant {}
model User {}
model Role {}
```

数据库表名使用 snake_case：

```prisma
@@map("tenants")
@@map("users")
```

字段在 Prisma 中使用 camelCase，映射到数据库 snake_case：

```prisma
tenantId String? @map("tenant_id")
createdAt DateTime @map("created_at")
```

## 7. 第一阶段 Prisma 模型草案

```prisma
model Tenant {
  id        String   @id @default(cuid())
  name      String
  code      String   @unique
  status    String   @default("pending")
  contact   String?
  phone     String?
  email     String?
  plan      String   @default("starter")
  expiredAt DateTime? @map("expired_at")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  users     User[]
  roles     Role[]

  @@map("tenants")
}

model User {
  id        String   @id @default(cuid())
  tenantId  String?  @map("tenant_id")
  account   String   @unique
  password  String
  name      String
  email     String?
  phone     String?
  type      String   @default("tenant")
  status    String   @default("active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  tenant    Tenant?  @relation(fields: [tenantId], references: [id])
  userRoles UserRole[]

  @@index([tenantId])
  @@map("users")
}

model Role {
  id          String   @id @default(cuid())
  tenantId    String?  @map("tenant_id")
  name        String
  code        String
  description String?
  scope       String   @default("tenant")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  tenant      Tenant?  @relation(fields: [tenantId], references: [id])
  userRoles   UserRole[]
  rolePermissions RolePermission[]

  @@unique([tenantId, code])
  @@index([tenantId])
  @@map("roles")
}

model Permission {
  id          String   @id @default(cuid())
  name        String
  code        String   @unique
  type        String
  parentId    String?  @map("parent_id")
  description String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  rolePermissions RolePermission[]

  @@map("permissions")
}
```

## 8. 索引建议

第一阶段建议索引：

- `users.tenant_id`
- `roles.tenant_id`
- `roles.tenant_id + roles.code`
- `operation_logs.tenant_id`
- `login_logs.user_id`
- `login_logs.created_at`

后续商品订单模块需要重点索引：

- 商品：`tenant_id + status`
- 商品 SKU：`product_id`
- 订单：`tenant_id + order_no`
- 订单：`tenant_id + status + created_at`
- 支付记录：`order_id`

## 9. 数据安全要求

- 密码必须哈希存储，禁止明文。
- 敏感字段后续需要脱敏展示。
- 删除优先使用软删除。
- 审计日志不可被普通用户删除。
- 租户隔离必须由后端强制实现。

## 10. 后续补充

后续需要继续补充：

- 商品中心完整模型
- 订单中心完整模型
- 库存流水模型
- 售后模型
- 财务结算模型
- 消息通知模型
