# Shop SaaS 使用手册

> 版本：v0.1 · 更新日期：2026-06-25

---

## 一、系统概览

Shop SaaS 是一个**全栈多租户商城 SaaS 管理平台**，面向平台运营方和入驻租户提供统一后台管理能力。

核心能力：

- **多租户隔离**：基于 `tenant_id` 字段的数据隔离，平台可跨租户监管，租户只能访问自身数据。
- **RBAC 权限体系**：支持平台级 / 租户级角色，细粒度到按钮和接口的权限控制。
- **统一认证**：JWT 双 Token（Access + Refresh），argon2 密码哈希。
- **国际化**：中 / 英双语切换。
- **暗色 / 亮色主题**切换。

---

## 二、快速启动

### 2.1 环境要求

| 工具 | 版本 |
|------|------|
| Node.js | ≥ 18 |
| pnpm | ≥ 9 |
| MySQL | ≥ 8.0 |

### 2.2 安装与初始化

```bash
# 安装依赖
pnpm install

# 初始化数据库（建表 + 写入种子数据）
pnpm --filter @shop-saas/api-server db:init
```

`db:init` 会执行：

1. Prisma 数据库迁移（建表）
2. Seed 脚本写入默认权限、角色、管理员账号和演示租户

### 2.3 启动服务

```bash
# 同时启动前端和后端
pnpm dev

# 或分别启动
pnpm dev:server   # 后端 API → http://localhost:3000
pnpm dev:admin    # 前端管理台 → http://localhost:5173
```

### 2.4 默认登录账号

| 账号 | 密码 | 角色 | 说明 |
|------|------|------|------|
| `admin` | `123456` | 平台超级管理员 | 拥有全部权限 |
| `tenant_admin` | `123456` | 租户管理员（星河优选） | 拥有当前租户全部权限 |

> Swagger 文档：`http://localhost:3000/api/docs`

---

## 三、功能模块说明

### 3.1 登录 / 认证

**路径**：`/login`

- 输入账号密码后点击「进入控制台」。
- 登录成功后，后端签发 Access Token（2 小时有效）和 Refresh Token（7 天有效），前端存储到 localStorage。
- 路由守卫：未登录自动跳转登录页，已登录访问登录页自动跳转工作台。
- 退出登录时清除全部 Token 和本地缓存。

### 3.2 经营工作台（Dashboard）

**路径**：`/dashboard` · **权限**：`dashboard:view`

系统首页，展示：

- **概览横幅**：当前阶段定位和技术架构说明。
- **指标卡片**：平台租户数、今日 GMV、待处理订单、风险提醒（当前为演示数据）。
- **阶段任务**：展示当前开发阶段的任务进度。
- **架构关键词**：pnpm workspace、Vue 3、TypeScript、Tailwind CSS、Naive UI、NestJS、Multi-tenant。

### 3.3 租户中枢

**路径**：`/tenants` · **权限**：`tenant:list:view`

管理平台上的所有租户（商家 / 品牌 / 组织）。

#### 功能列表

| 操作 | 权限 | 说明 |
|------|------|------|
| 查看租户列表 | `tenant:list:view` | 支持按名称 / 编码 / 联系人搜索，按状态筛选，分页浏览 |
| 新增租户 | `tenant:create:submit` | 填写租户名称、编码（唯一）、状态、联系人、电话、邮箱 |
| 编辑租户 | `tenant:update:submit` | 修改租户信息（编码不可修改） |
| 启用 / 禁用 | `tenant:update:submit` | 切换租户状态为 active 或 disabled |
| 初始化管理员 | `tenant:admin:init` | 为该租户创建一个管理员账号并自动分配 `tenant_admin` 角色 |
| 删除租户 | `tenant:delete:submit` | 物理删除租户（后续可扩展为软删除） |

#### 租户状态

| 状态 | 说明 |
|------|------|
| `pending` | 待审核 |
| `active` | 正常 |
| `disabled` | 已禁用（租户用户无法登录） |
| `expired` | 已过期 |

#### 租户初始化流程

点击「初始化管理员」时系统自动执行：

1. 查找或创建该租户的 `tenant_admin` 角色
2. 创建用户并绑定到该租户
3. 将用户与角色关联

#### 平台用户切换租户上下文

平台用户（`type = platform`）在顶部导航栏可通过下拉框切换当前查看的租户，切换后数据接口会携带 `X-Tenant-Id` 请求头。

租户用户无法切换租户。

### 3.4 用户管理（成员权限）

**路径**：`/users` · **权限**：`user:list:view`

管理平台用户、租户员工和消费者账号。

#### 功能列表

| 操作 | 权限 | 说明 |
|------|------|------|
| 查看用户列表 | `user:list:view` | 支持按账号 / 姓名 / 邮箱搜索，按状态筛选，分页浏览 |
| 新增用户 | `user:create:submit` | 填写账号、密码、姓名、邮箱、类型、状态 |
| 编辑用户 | `user:update:submit` | 修改姓名、邮箱、状态（账号和类型不可修改） |
| 分配角色 | `user:role:assign` | 为用户分配一个或多个角色 |
| 重置密码 | `user:password:reset` | 将用户密码重置为指定值 |

#### 用户类型

| 类型 | 说明 |
|------|------|
| `platform` | 平台用户，不隶属于某个租户 |
| `tenant` | 租户用户，必须绑定 `tenant_id` |
| `customer` | 消费者用户，预留（商城前台使用） |

#### 数据隔离规则

- **平台用户**：可以查看和管理所有租户的用户。如果切换了租户上下文，只查看该租户下的用户。
- **租户用户**：只能查看和管理当前租户下的用户。

### 3.5 角色权限

**路径**：`/access` · **权限**：`role:list:view`

统一管理平台角色、租户角色与权限点。

#### 功能列表

| 操作 | 权限 | 说明 |
|------|------|------|
| 查看角色列表 | `role:list:view` | 展示所有角色及其权限数量 |
| 查看权限列表 | `permission:list:view` | 展示所有权限点（来自 seed 初始化） |
| 新增角色 | `role:create:submit` | 填写角色名称、编码（同租户内唯一）、作用域、描述 |
| 编辑角色 | `role:update:submit` | 修改角色名称和描述 |
| 授权（分配权限） | `role:permission:assign` | 为角色选择权限点（全量替换模式） |

#### 角色作用域

| 作用域 | 说明 |
|------|------|
| `platform` | 平台级角色，可跨租户 |
| `tenant` | 租户级角色，只在当前租户内生效 |

#### 内置角色（seed 创建）

| 角色 | 编码 | 作用域 | 说明 |
|------|------|------|------|
| 平台超级管理员 | `platform_super_admin` | platform | 拥有全部权限 |
| 租户管理员 | `tenant_admin` | tenant | 拥有当前租户全部权限（每个租户独立一份） |

### 3.6 商品中心

**路径**：`/products` · **权限**：`product:list:view`

管理商品分类和商品基础信息。

#### 功能列表

| 操作 | 权限 | 说明 |
|------|------|------|
| 查看商品分类 | `product:list:view` | 树形展示分类，支持新增/编辑/删除 |
| 查看商品列表 | `product:list:view` | 支持按名称/编码搜索，按分类/状态筛选 |
| 新增商品 | `product:create:submit` | 填写名称、编码、分类、价格、库存等 |
| 编辑商品 | `product:update:submit` | 修改商品信息（编码不可修改） |
| 删除商品 | `product:delete:submit` | 删除商品 |

#### 商品状态

| 状态 | 说明 |
|------|------|
| `draft` | 草稿 |
| `on_sale` | 在售 |
| `off_sale` | 下架 |
| `archived` | 归档 |

### 3.7 订单履约

**当前状态**：导航菜单中已预留入口，功能正在开发中。

| 菜单 | 权限 | 状态 |
|------|------|------|
| 订单列表 | `order:list:view` | 开发中 |

### 3.8 审计日志

**路径**：`/audit/operations` · **权限**：`audit:operation:view`

记录系统关键操作，便于回溯和排障。

| 菜单 | 权限 | 状态 |
|------|------|------|
| 操作日志 | `audit:operation:view` | 已实现 |
| 登录日志 | `audit:login:view` | 已实现 |

### 3.9 系统设置

**当前状态**：导航菜单中已预留入口，功能尚未实现。

| 菜单 | 权限 | 状态 |
|------|------|------|
| 系统设置 | `system:setting:view` | 待开发 |

---

## 四、权限体系

### 4.1 权限模型

```
用户 (User)
 └── 用户角色 (UserRole)  —— 多对多
      └── 角色 (Role)
           └── 角色权限 (RolePermission)  —— 多对多
                ── 权限 (Permission)
```

### 4.2 权限编码规范

格式：`业务域:资源:动作`

### 4.3 当前权限清单

| 权限名称 | 编码 | 类型 |
|----------|------|------|
| 工作台查看 | `dashboard:view` | page |
| 租户列表查看 | `tenant:list:view` | page |
| 租户创建 | `tenant:create:submit` | button |
| 租户更新 | `tenant:update:submit` | button |
| 租户删除 | `tenant:delete:submit` | button |
| 租户管理员初始化 | `tenant:admin:init` | button |
| 用户列表查看 | `user:list:view` | page |
| 用户创建 | `user:create:submit` | button |
| 用户更新 | `user:update:submit` | button |
| 用户角色分配 | `user:role:assign` | button |
| 用户密码重置 | `user:password:reset` | button |
| 角色列表查看 | `role:list:view` | page |
| 角色创建 | `role:create:submit` | button |
| 角色更新 | `role:update:submit` | button |
| 角色权限分配 | `role:permission:assign` | button |
| 权限列表查看 | `permission:list:view` | page |
| 商品列表查看 | `product:list:view` | page |
| 商品创建 | `product:create:submit` | button |
| 商品更新 | `product:update:submit` | button |
| 商品删除 | `product:delete:submit` | button |
| 商品分类管理 | `product:category:submit` | button |
| 操作日志查看 | `audit:operation:view` | page |
| 登录日志查看 | `audit:login:view` | page |

### 4.4 权限生效机制

**后端**：

1. 用户登录时，从数据库加载该用户所有角色的权限编码，写入 JWT。
2. 每次请求经过 `AuthGuard`（验证 Token）→ `PermissionGuard`（检查 `@RequirePermissions()` 声明的权限是否在 JWT 中）。
3. 无权限返回 `403 无访问权限`。

**前端**：

1. `PermissionButton` 组件根据 `permissionStore.hasPermission()` 控制按钮是否渲染。
2. 侧边栏菜单根据权限过滤显示。
3. `permissionStore` 的权限来源为登录后端返回的 `user.permissions`。

> **重要提示**：修改权限后（如 seed 更新），用户需要**重新登录**才能获取新的权限列表，因为权限是在登录时写入 JWT 的。

---

## 五、多租户隔离

### 5.1 隔离策略

当前采用**共享数据库 + `tenant_id` 字段隔离**：

- 所有租户业务表包含 `tenant_id` 字段。
- 租户用户的所有查询自动附加 `where.tenant_id = currentUser.tenantId`。
- 平台用户可跨租户查看数据（通过 `X-Tenant-Id` 请求头或查询参数指定）。

### 5.2 租户上下文传递

```
前端 localStorage (shop-saas-tenant-context)
  ↓ api-client 请求拦截器
HTTP Header: X-Tenant-Id
  ↓ 后端
resolveTenantScope(user, requestedTenantId)
  → 平台用户：使用请求指定的 tenantId
  → 租户用户：强制使用 JWT 中的 tenantId（忽略客户端传入值）
```

### 5.3 安全规则

- 前端不能直接决定租户隔离。
- 后端不能直接信任客户端传入的 `tenantId`。
- 所有租户业务查询必须经过 `resolveTenantScope` 或 `ensureSameTenant` 处理。

---

## 六、API 接口

### 6.1 通用规范

- **基础路径**：`/api`
- **认证方式**：`Authorization: Bearer <access_token>`
- **租户上下文**：`X-Tenant-Id: <tenant_id>`（仅平台用户使用）

### 6.2 响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "requestId": "req_xxx"
}
```

### 6.3 错误码

| code | 说明 |
|------|------|
| `0` | 成功 |
| `40000` | 请求参数错误 |
| `40001` | 未登录或 Token 无效 |
| `40003` | 无访问权限 |
| `40004` | 资源不存在 |
| `40009` | 数据冲突（如编码已存在） |
| `40100` | 租户不存在或已禁用 |
| `50000` | 系统内部错误 |

### 6.4 接口清单

#### 认证模块 `/api/auth`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/auth/login` | 公开 | 登录，返回 accessToken + refreshToken + 用户信息 |
| POST | `/auth/logout` | 已登录 | 退出登录 |
| POST | `/auth/refresh` | 公开 | 刷新 Token（开发中） |
| GET | `/auth/profile` | 已登录 | 获取当前用户资料（JWT 内容） |

#### 租户模块 `/api/tenants`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/tenants` | `tenant:list:view` | 租户列表（分页、搜索、状态筛选） |
| GET | `/tenants/:id` | `tenant:list:view` | 租户详情 |
| POST | `/tenants` | `tenant:create:submit` | 创建租户 |
| PATCH | `/tenants/:id` | `tenant:update:submit` | 更新租户 |
| DELETE | `/tenants/:id` | `tenant:delete:submit` | 删除租户 |
| POST | `/tenants/:id/admin` | `tenant:admin:init` | 初始化租户管理员 |

#### 用户模块 `/api/users`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/users` | `user:list:view` | 用户列表（分页、搜索、状态筛选） |
| GET | `/users/:id` | `user:list:view` | 用户详情 |
| POST | `/users` | `user:create:submit` | 创建用户 |
| PATCH | `/users/:id` | `user:update:submit` | 更新用户 |
| POST | `/users/:id/roles` | `user:role:assign` | 分配用户角色 |
| POST | `/users/:id/password` | `user:password:reset` | 重置用户密码 |

#### 角色模块 `/api/roles`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/roles` | `role:list:view` | 角色列表 |
| GET | `/roles/:id` | `role:list:view` | 角色详情 |
| POST | `/roles` | `role:create:submit` | 创建角色 |
| PATCH | `/roles/:id` | `role:update:submit` | 更新角色 |
| POST | `/roles/:id/permissions` | `role:permission:assign` | 分配角色权限 |

#### 权限模块 `/api/permissions`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/permissions` | `permission:list:view` | 权限列表 |

#### 商品模块 `/api/products`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/products/categories` | `product:list:view` | 商品分类列表 |
| POST | `/products/categories` | `product:category:submit` | 创建商品分类 |
| PATCH | `/products/categories/:id` | `product:category:submit` | 更新商品分类 |
| DELETE | `/products/categories/:id` | `product:category:submit` | 删除商品分类 |
| GET | `/products` | `product:list:view` | 商品列表（分页、搜索、分类/状态筛选） |
| GET | `/products/:id` | `product:list:view` | 商品详情 |
| POST | `/products` | `product:create:submit` | 创建商品 |
| PATCH | `/products/:id` | `product:update:submit` | 更新商品 |
| DELETE | `/products/:id` | `product:delete:submit` | 删除商品 |

---

## 七、数据库结构

### 7.1 核心表

| 表名 | 说明 |
|------|------|
| `tenants` | 租户 |
| `users` | 用户 |
| `roles` | 角色 |
| `permissions` | 权限 |
| `user_roles` | 用户 - 角色关联 |
| `role_permissions` | 角色 - 权限关联 |
| `operation_logs` | 操作日志 |
| `login_logs` | 登录日志 |
| `product_categories` | 商品分类 |
| `products` | 商品 |
| `product_skus` | 商品 SKU |

### 7.2 表关系

```
Tenant (1) ──── (N) User
Tenant (1) ──── (N) Role
Tenant (1) ──── (N) ProductCategory
Tenant (1) ──── (N) Product

User (N) ──── (N) Role         ← 通过 user_roles
Role (N) ──── (N) Permission   ← 通过 role_permissions

ProductCategory (1) ──── (N) ProductCategory  ← 父子分类
ProductCategory (1) ──── (N) Product
Product (1) ──── (N) ProductSKU
```

### 7.3 种子数据

`pnpm --filter @shop-saas/api-server prisma:seed` 写入：

1. **23 个权限点**（覆盖工作台、租户、用户、角色、权限、商品模块）
2. **平台超级管理员角色** `platform_super_admin` → 绑定全部权限
3. **平台管理员账号** `admin` / `123456` → 绑定平台超级管理员角色
4. **演示租户** 星河优选（`star-market`）
5. **租户管理员角色** `tenant_admin` → 绑定全部权限
6. **租户管理员账号** `tenant_admin` / `123456` → 绑定租户管理员角色

---

## 八、工程结构

```
shop-saas/
├── apps/
│   ├── admin-web/          # PC 管理后台（Vite + Vue 3 + TS + Tailwind + Naive UI）
│   │   └── src/
│   │       ├── components/ # 公共组件（DataTable, MetricCard, PageHero, PermissionButton, SearchForm, StatusPill）
│   │       ├── layouts/    # 布局（AdminLayout）
│   │       ├── locales/    # i18n 语言包（zh-CN, en-US）
│   │       ├── modules/    # 业务模块
│   │       │   ├── auth/       # 登录
│   │       │   ├── dashboard/  # 工作台
│   │       │   ├── tenant/     # 租户管理
│   │       │   ├── user/       # 用户管理
│   │       │   ├── access/     # 角色权限
│   │       │   ├── product/    # 商品中心
│   │       │   └── audit/      # 审计日志
│   │       ├── router/     # 路由与菜单配置
│   │       ├── stores/     # Pinia 状态管理
│   │       └── utils/      # 工具函数
│   │
│   ── api-server/         # 后端 API（NestJS + Prisma + MySQL）
│       ├── prisma/
│       │   ├── schema.prisma   # 数据库模型
│       │   └── seed.ts         # 种子数据
│       └── src/
│           ├── common/     # 通用（Guards, Decorators, 租户隔离, 类型）
│           ├── database/   # PrismaService
│           └── modules/    # 业务模块（auth, tenant, user, role, permission, product）
│
├── packages/               # 共享包
│   ├── api-client/         # HTTP 请求 SDK（Token 注入、响应解析、错误处理）
│   ├── auth/               # Token 存取、租户上下文管理
│   ├── config/             # 共享配置（端口号等）
│   ├── constants/          # 常量与枚举
│   ├── schemas/            # Zod 校验 Schema
│   ├── shared/             # 通用工具函数
│   └── types/              # 共享 TypeScript 类型
│
├── docs/                   # 设计与需求文档
└── scripts/                # 工程脚本
```

---

## 九、常用操作指引

### 9.1 新建一个租户并配置管理员

1. 使用 `admin` / `123456` 登录
2. 进入「租户中枢」
3. 点击「新增租户」，填写租户名称、编码等信息
4. 保存后，在列表中找到新租户，点击「初始化管理员」
5. 填写管理员账号、密码、姓名等信息
6. 保存后，该管理员即可使用填写的账号密码登录

### 9.2 为新租户分配自定义角色

1. 进入「角色权限」
2. 点击「新增角色」，设置名称、编码和作用域
3. 保存后，点击「授权」，选择需要分配的权限点
4. 进入「用户管理」，找到目标用户，点击「分配角色」

### 9.3 重置用户密码

1. 进入「用户管理」
2. 在目标用户行点击「重置密码」
3. 输入新密码，保存即可

### 9.4 重新加载种子数据

```bash
# 重建数据库并写入种子数据
pnpm --filter @shop-saas/api-server db:init

# 只写入种子数据（不重建表结构）
pnpm --filter @shop-saas/api-server prisma:seed
```

> 更新种子数据后，所有已登录用户需要**重新登录**以获取最新的权限列表。

---

## 十、后续规划

当前系统处于**第一阶段**，以下功能已规划但尚未实现：

| 模块 | 说明 |
|------|------|
| 订单履约 | 订单列表、发货、售后处理 |
| 系统设置 | 平台配置、通知设置 |
| 动态菜单 | 后端返回用户可访问的菜单列表 |
| 数据权限 | 按部门、按创建人、按店铺等维度控制数据范围 |
| 租户套餐 | 按套餐控制租户可用功能 |
| Token 刷新 | 完善 Refresh Token 无感续期 |
| 文件上传 | 商品图片、用户头像等文件上传能力 |
| 富文本编辑 | 商品详情富文本编辑 |
