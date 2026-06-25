# 重构开发记录

> 本文档记录商城 SaaS 重构过程中的关键步骤、技术决策、完成情况与验证结果。后续每个阶段开发都应同步更新本文档。

## 2026-06-17：初始化 monorepo 重构基础

### 背景

项目决定完全重构，不再基于旧版 Vue3 + Express 商城后台继续改造。旧代码仅作为历史版本，不作为新架构实现基础。

重构目标参考：

- `docs/requirements-upgrade.md`
- `docs/technical-architecture.md`

### 已完成事项

#### 1. 清理旧代码

删除旧版实现：

- `src/`
- `server/`
- `public/`
- 旧 `index.html`
- 旧 `vite.config.js`
- 旧 `.eslintrc.cjs`

保留：

- `docs/`
- `README.md`
- `.gitignore`
- `LICENSE`

#### 2. 建立 monorepo 根工程

新增：

- `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json`
- `pnpm-lock.yaml`

采用：

- pnpm workspace
- Turborepo
- TypeScript

#### 3. 创建 PC 管理后台

应用位置：

- `apps/admin-web/`

技术栈：

- Vite
- Vue 3
- TypeScript
- Tailwind CSS
- Naive UI
- Pinia
- Vue Router

已完成页面：

- 登录页：`apps/admin-web/src/modules/auth/pages/AuthLogin.vue`
- 后台布局：`apps/admin-web/src/layouts/AdminLayout.vue`
- 工作台：首页：`apps/admin-web/src/modules/dashboard/pages/DashboardHome.vue`
- 租户中枢页：`apps/admin-web/src/modules/tenant/pages/TenantOverview.vue`

视觉方向：

- 现代 SaaS 控制台风格
- 深色渐变登录页
- 圆角卡片
- 玻璃拟态
- 亮暗主题切换

#### 4. 创建 NestJS 后端服务

应用位置：

- `apps/api-server/`

技术栈：

- NestJS
- TypeScript
- Swagger / OpenAPI

已完成：

- `apps/api-server/src/main.ts`
- `apps/api-server/src/app.module.ts`
- `apps/api-server/src/modules/health/health.controller.ts`
- `apps/api-server/src/modules/health/health.module.ts`
- 预留 `auth`、`tenant`、`user` 模块

#### 5. 创建共享 packages

新增：

- `packages/api-client/`
- `packages/auth/`
- `packages/config/`
- `packages/constants/`
- `packages/shared/`
- `packages/types/`

当前能力：

- API 响应类型
- 分页类型
- 用户资料类型
- 租户摘要类型
- 租户状态枚举
- 用户角色枚举
- token 工具
- axios 请求基础封装
- 通用格式化工具

#### 6. 更新 README

`README.md` 已改为新项目说明，包含：

- 技术栈
- 目录结构
- 开发命令
- 文档入口
- 当前阶段目标

### 验证结果

已执行：

```bash
pnpm install
pnpm typecheck
pnpm build
```

结果：

- 依赖安装成功
- 类型检查成功：8 个 workspace 全部通过
- 构建成功：8 个 workspace 全部通过

### 已知提示

#### admin-web chunk 体积提示

构建时 Vite 提示部分 chunk 超过 500KB。

原因：

- Naive UI、图标库和 Vue 生态初始打包体积较大。

后续处理：

- 路由懒加载
- manualChunks 分包
- 按需加载图标和组件

#### Turborepo 共享包 outputs 提示

部分 packages 的 build 当前为 `tsc --noEmit`，没有生成 `dist`，因此 Turborepo 提示未发现输出文件。

后续处理：

- 若共享包需要真实构建产物，再统一改为 emit 到 `dist`。
- 当前阶段不影响类型检查和应用构建。

## 2026-06-17：补充设计文档与 Prisma / 权限基础

### 背景

用户要求后续每步开发最好都有文档记录。本阶段在继续开发前，先补充设计文档，并记录 Prisma 与前端权限基础框架的接入过程。

### 已完成事项

#### 1. 补充设计文档

新增：

- `docs/database-design.md`：数据库设计文档
- `docs/tenant-design.md`：多租户设计文档
- `docs/permission-design.md`：权限设计文档
- `docs/api-design.md`：API 设计文档

这些文档分别记录：

- 第一阶段核心数据模型
- 多租户隔离策略
- RBAC 权限模型
- API 路径、响应格式、错误码与认证 Header 规范

#### 2. 接入 Prisma 基础结构

为 `apps/api-server` 增加 Prisma：

- `@prisma/client`
- `prisma`

首次安装到 Prisma 7 后，执行 `prisma generate` 时发现 Prisma 7 不再支持在 schema datasource 中直接配置 `url = env("DATABASE_URL")`，该方式需要迁移到 `prisma.config.ts`。

当前阶段为了保持 schema 简洁和生态兼容，已改用 Prisma 6：

- `@prisma/client@^6.19.3`
- `prisma@^6.19.3`

新增：

- `apps/api-server/prisma/schema.prisma`
- `apps/api-server/.env.example`
- `apps/api-server/src/database/prisma.service.ts`
- `apps/api-server/src/database/database.module.ts`

并在 `apps/api-server/src/app.module.ts` 中引入 `DatabaseModule`。

#### 3. 建立第一阶段 Prisma schema

当前 schema 已包含：

- Tenant
- User
- Role
- Permission
- UserRole
- RolePermission
- OperationLog
- LoginLog

覆盖：

- 租户状态
- 用户类型
- 用户状态
- 角色作用域
- 权限类型
- 用户角色关联
- 角色权限关联
- 登录日志
- 操作日志

#### 4. 完善前端菜单与权限基础框架

新增：

- `apps/admin-web/src/router/menus.ts`
- `apps/admin-web/src/stores/permission.store.ts`
- `apps/admin-web/src/components/PermissionButton.vue`

调整：

- `apps/admin-web/src/layouts/AdminLayout.vue`：侧边栏菜单改为根据权限 store 生成。
- `apps/admin-web/src/modules/tenant/pages/TenantOverview.vue`：新增租户按钮改为使用 `PermissionButton`。

当前前端权限能力：

- 权限码类型 `PermissionCode`
- 菜单权限过滤
- `hasPermission`
- `hasAnyPermission`
- 权限按钮组件

### 验证记录

已执行：

```bash
pnpm --filter @shop-saas/api-server prisma:generate
pnpm typecheck
pnpm build
```

结果：

- Prisma Client 生成成功。
- 第一次类型检查发现 `AdminLayout.vue` 中 `RouterLink` 的 `to` 类型可能为 `undefined`，已修复为显式 string。
- 修复后类型检查通过：8 个 workspace 全部成功。
- 构建通过：8 个 workspace 全部成功。

已知提示：

- `admin-web` 构建仍有 chunk 超过 500KB 的提示，后续通过路由懒加载和 manualChunks 优化。
- 部分共享包当前 build 仍为 `tsc --noEmit`，Turborepo 可能提示没有输出文件；当前不影响应用构建。

## 2026-06-17：实现后端基础 API 骨架

### 背景

在完成 Prisma 和前端权限基础后，本阶段继续补齐 NestJS 后端的横切能力与第一批业务 API 骨架，为后续接入真实认证、租户隔离和用户管理做准备。

### 已完成事项

#### 1. 请求上下文与统一响应

新增：

- `apps/api-server/src/common/middleware/request-id.middleware.ts`
- `apps/api-server/src/common/interceptors/response.interceptor.ts`
- `apps/api-server/src/common/filters/http-exception.filter.ts`
- `apps/api-server/src/common/decorators/require-permissions.decorator.ts`

能力：

- 为每个请求生成或透传 `x-request-id`。
- 成功响应统一包装为 `{ code, message, data, requestId }`。
- 异常响应统一包装为 `{ code, message, data: null, requestId }`。
- 初步提供 `@RequirePermissions()` 装饰器，用于后续权限 Guard。

调整：

- `apps/api-server/src/main.ts` 注册全局响应拦截器、异常过滤器和参数校验 Pipe。
- `apps/api-server/src/app.module.ts` 注册 `RequestIdMiddleware`。
- `apps/api-server/src/modules/health/health.controller.ts` 改为只返回业务数据，由拦截器统一包装响应。

#### 2. Auth API 骨架

新增：

- `apps/api-server/src/modules/auth/dto/login.dto.ts`
- `apps/api-server/src/modules/auth/auth.controller.ts`
- `apps/api-server/src/modules/auth/auth.service.ts`

已实现接口骨架：

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/profile`

说明：

- 当前登录仍为开发期骨架。
- 密码校验和 JWT 签发后续接入。

#### 3. Tenant API 骨架

新增：

- `apps/api-server/src/modules/tenant/dto/create-tenant.dto.ts`
- `apps/api-server/src/modules/tenant/dto/update-tenant.dto.ts`
- `apps/api-server/src/modules/tenant/dto/query-tenant.dto.ts`
- `apps/api-server/src/modules/tenant/tenant.controller.ts`
- `apps/api-server/src/modules/tenant/tenant.service.ts`

已实现接口骨架：

- `GET /api/tenants`
- `GET /api/tenants/:id`
- `POST /api/tenants`
- `PATCH /api/tenants/:id`
- `DELETE /api/tenants/:id`

说明：

- 支持分页、关键词、状态筛选。
- 当前删除为物理删除，后续可调整为软删除。

#### 4. User API 骨架

新增：

- `apps/api-server/src/modules/user/dto/create-user.dto.ts`
- `apps/api-server/src/modules/user/dto/user.dto.ts`
- `apps/api-server/src/modules/user/user.controller.ts`
- `apps/api-server/src/modules/user/user.service.ts`

已实现接口骨架：

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PATCH /api/users/:id`

说明：

- 支持分页、关键词、状态筛选。
- 创建用户时会对密码做开发期 SHA-256 哈希。
- 后续应替换为 bcrypt 或 argon2。

#### 5. Prisma seed

新增：

- `apps/api-server/prisma/seed.ts`

新增命令：

```bash
pnpm --filter @shop-saas/api-server prisma:seed
```

seed 内容：

- 初始化第一批权限。
- 初始化平台超级管理员角色。
- 将全部权限绑定给平台超级管理员。
- 初始化默认平台管理员账号：`admin / 123456`。

### 文档同步

已更新：

- `docs/api-design.md`

补充内容：

- 当前已实现的 API 骨架。
- 统一响应由拦截器完成。
- Tenant / User 已实现接口范围和限制说明。

### 验证记录

已执行：

```bash
pnpm typecheck
pnpm build
```

第一次类型检查发现后端引用 `express` 类型但未安装类型声明：

```text
Cannot find module 'express' or its corresponding type declarations.
```

处理：

```bash
pnpm --filter @shop-saas/api-server add -D @types/express
```

再次执行后结果：

- 类型检查通过：8 个 workspace 全部成功。
- 构建通过：8 个 workspace 全部成功。

已知提示：

- `admin-web` 仍存在 chunk 超过 500KB 的构建提示，后续通过路由懒加载和 manualChunks 优化。

## 2026-06-17：接入国际化与基础认证 Guard

### 背景

用户要求继续推进，并新增国际化能力，当前阶段先支持中文和英文。同时继续完善后端认证能力，将前一阶段的开发期认证骨架推进到 JWT + argon2 + Guard 模式。

### 已完成事项

#### 1. 前端国际化基础能力

新增依赖：

```bash
pnpm --filter @shop-saas/admin-web add vue-i18n
```

新增：

- `apps/admin-web/src/locales/index.ts`
- `apps/admin-web/src/locales/zh-CN.ts`
- `apps/admin-web/src/locales/en-US.ts`
- `docs/i18n-design.md`

已接入：

- `apps/admin-web/src/main.ts` 注册 i18n。
- `apps/admin-web/src/stores/app.store.ts` 增加语言状态与 `setLocale()`。
- `apps/admin-web/src/layouts/AdminLayout.vue` 增加语言切换选择器。
- `apps/admin-web/src/router/menus.ts` 菜单改为使用 i18n key。
- 登录页、工作台、租户页主要文案接入语言包。

当前支持语言：

- `zh-CN`
- `en-US`

本地缓存 key：

```text
shop-saas-locale
```

#### 2. 后端 JWT 与 argon2

新增依赖：

```bash
pnpm --filter @shop-saas/api-server add @nestjs/jwt @nestjs/passport passport passport-jwt argon2
pnpm --filter @shop-saas/api-server add -D @types/passport-jwt @types/passport
```

新增：

- `apps/api-server/src/common/types/jwt-payload.ts`
- `apps/api-server/src/common/types/request-user.ts`
- `apps/api-server/src/common/types/auth-request.ts`
- `apps/api-server/src/common/security/security.module.ts`

调整：

- `apps/api-server/src/modules/auth/auth.service.ts`：登录使用 argon2 校验密码，并签发 accessToken / refreshToken。
- `apps/api-server/src/modules/user/user.service.ts`：创建用户使用 argon2 哈希密码。
- `apps/api-server/prisma/seed.ts`：默认管理员密码改为 argon2 哈希。
- `apps/api-server/.env.example`：增加 JWT 过期时间配置。

#### 3. Auth Guard 与 Permission Guard

新增：

- `apps/api-server/src/common/decorators/public.decorator.ts`
- `apps/api-server/src/common/decorators/current-user.decorator.ts`
- `apps/api-server/src/common/guards/auth.guard.ts`
- `apps/api-server/src/common/guards/permission.guard.ts`

调整：

- `apps/api-server/src/app.module.ts` 注册全局 AuthGuard 与 PermissionGuard。
- `apps/api-server/src/modules/health/health.controller.ts` 标记为 `@Public()`。
- `apps/api-server/src/modules/auth/auth.controller.ts`：登录和刷新 Token 标记为 `@Public()`，profile 使用 `@CurrentUser()`。

当前策略：

- 默认接口需要 Bearer Token。
- `@Public()` 接口跳过认证。
- `@RequirePermissions()` 元数据由 PermissionGuard 校验。
- 权限来自 JWT payload 中的 `permissions`。

#### 4. 文档同步

已更新：

- `docs/requirements-upgrade.md`：补充国际化非功能需求。
- `docs/technical-architecture.md`：技术选型表补充 vue-i18n。
- `docs/api-design.md`：更新密码哈希与 Guard 说明。
- `docs/i18n-design.md`：新增国际化设计文档。

### 验证记录

已执行：

```bash
pnpm typecheck
pnpm build
```

第一次类型检查发现 `JwtService.signAsync` 的 `expiresIn` 类型与从环境变量读取的 string 不兼容。

处理：

- 当前先使用数字秒数：access token 2 小时，refresh token 7 天。
- 后续如需从环境变量读取字符串，需要补充更严格的配置解析和类型转换。

再次执行后结果：

- 类型检查通过：8 个 workspace 全部成功。
- 构建通过：8 个 workspace 全部成功。

已知提示：

- `admin-web` 仍存在 chunk 超过 500KB 的构建提示，且接入 vue-i18n 后体积略有增加。后续通过路由懒加载、manualChunks 和语言包拆分优化。

## 2026-06-17：接入真实登录、租户隔离与角色权限 API

### 背景

在完成 JWT、argon2、Auth Guard、Permission Guard 和国际化后，本阶段继续推进真实前后端登录链路、基础租户隔离、角色权限 API，以及前端构建分包优化。

### 已完成事项

#### 1. 前端登录切换为真实 Auth API

新增：

- `apps/admin-web/src/modules/auth/api.ts`

调整：

- `packages/types/src/index.ts`：补充 `LoginResult` 和新版 `UserProfile`。
- `packages/auth/src/index.ts`：补充 refresh token 存储与 `clearTokens()`。
- `apps/admin-web/src/stores/auth.store.ts`：登录改为请求 `POST /api/auth/login`。
- `apps/admin-web/src/modules/auth/pages/AuthLogin.vue`：登录方法改为异步调用真实 API。
- `apps/admin-web/vite.config.ts`：开发环境代理 `/api` 到 `http://localhost:3000`。

当前行为：

- 前端提交账号密码到后端。
- 后端返回 accessToken、refreshToken 和用户信息。
- 前端持久化 token 和用户资料。

#### 2. 租户上下文与基础隔离

新增：

- `apps/api-server/src/common/decorators/current-tenant.decorator.ts`
- `apps/api-server/src/common/tenant/tenant-scope.ts`

调整：

- `apps/api-server/src/common/types/jwt-payload.ts`：payload 增加 `name`。
- `apps/api-server/src/common/types/request-user.ts`：request user 增加 `name`。
- `apps/api-server/src/common/guards/auth.guard.ts`：将 JWT payload 写入 request.user。
- `apps/api-server/src/modules/tenant/tenant.controller.ts`
- `apps/api-server/src/modules/tenant/tenant.service.ts`
- `apps/api-server/src/modules/user/user.controller.ts`
- `apps/api-server/src/modules/user/user.service.ts`

当前策略：

- 平台用户可以查看全局数据。
- 租户用户只能访问自身 `tenantId` 数据。
- 租户用户访问其他租户数据时抛出无权限异常。

#### 3. Role / Permission API 骨架

新增：

- `apps/api-server/src/modules/role/dto/role.dto.ts`
- `apps/api-server/src/modules/role/role.controller.ts`
- `apps/api-server/src/modules/role/role.service.ts`
- `apps/api-server/src/modules/role/role.module.ts`
- `apps/api-server/src/modules/permission/permission.controller.ts`
- `apps/api-server/src/modules/permission/permission.service.ts`
- `apps/api-server/src/modules/permission/permission.module.ts`

调整：

- `apps/api-server/src/app.module.ts` 注册 RoleModule 和 PermissionModule。

当前接口骨架：

- `GET /api/roles`
- `GET /api/roles/:id`
- `POST /api/roles`
- `PATCH /api/roles/:id`
- `POST /api/roles/:id/permissions`
- `GET /api/permissions`

#### 4. 前端路由懒加载与分包优化

调整：

- `apps/admin-web/src/router/index.ts`：页面和布局改为动态 import。
- `apps/admin-web/vite.config.ts`：增加 manualChunks。

当前分包：

- vue
- naive
- icons
- vendor

### 验证记录

已执行：

```bash
pnpm typecheck
pnpm build
```

结果：

- 类型检查通过：8 个 workspace 全部成功。
- 构建通过：8 个 workspace 全部成功。

分包效果：

- 页面与布局已拆成独立 chunk。
- `vue`、`icons`、`vendor` 已独立分包。
- `naive` 独立分包后仍约 612KB，仍触发 Vite 500KB 体积提示。

已知提示：

- `naive` chunk 超过 500KB，属于 UI 库集中分包后的体积提示，不影响构建运行。
- 部分共享包当前 build 为 `tsc --noEmit`，Turborepo 仍提示没有输出文件；当前不影响应用构建。

## 2026-06-18：创建真实登录账号并完善登录体验

### 背景

用户要求继续推进，并明确需要创建真实登录账号。本阶段重点处理数据库初始化、seed 默认账号、前端登录 loading/错误提示，并记录数据库连接过程中的问题。

### 已完成事项

#### 1. 真实登录账号

当前默认真实登录账号：

```text
账号：admin
密码：123456
角色：平台超级管理员
```

该账号通过 Prisma seed 创建，密码使用 argon2 哈希存储。

涉及文件：

- `apps/api-server/prisma/seed.ts`
- `apps/api-server/package.json`

新增命令：

```bash
pnpm --filter @shop-saas/api-server db:init
```

命令会依次执行：

```bash
pnpm prisma:push
pnpm prisma:seed
```

#### 2. 数据库初始化过程

当前 `.env` 使用 TiDB Cloud MySQL 连接。

首次执行 `db:init` 时遇到 TiDB Cloud serverless 要求安全连接：

```text
Connections using insecure transport are prohibited.
```

处理：

- 为 `DATABASE_URL` 增加 `sslaccept=strict`。

随后连接到 `sys` 数据库时出现：

```text
The `sys` database is a system database, it should not be altered with prisma migrate.
```

处理：

- 将数据库从 `sys` 改为业务库 `shop_saas`。
- 执行 `prisma:push` 后，Prisma 自动创建 `shop_saas` 数据库并同步 schema。

#### 3. seed 修复

首次执行 seed 时，平台角色使用 `tenantId_code` 复合唯一键并传入 `tenantId: null`，TypeScript 不接受该用法。

处理：

- 改为先用 `findFirst({ tenantId: null, code })` 查询平台角色。
- 存在则 update，不存在则 create。

执行结果：

```bash
pnpm --filter @shop-saas/api-server prisma:push
pnpm --filter @shop-saas/api-server prisma:seed
```

结果：

- 数据库 schema 同步成功。
- 默认平台管理员账号 seed 成功。

#### 4. 前端登录体验

调整：

- `apps/admin-web/src/modules/auth/pages/AuthLogin.vue`

新增：

- 登录 loading 状态。
- 登录失败错误提示。
- 防止重复点击登录按钮。

#### 5. 文档同步

已更新：

- `README.md`：补充真实登录账号和初始化命令。
- `docs/api-design.md`：补充默认账号与初始化命令。
- `docs/development-log.md`：记录本阶段过程。

### 待验证

下一步执行：

```bash
pnpm typecheck
pnpm build
```

## 2026-06-18：角色权限前端页面与 API 错误处理

### 背景

在真实登录账号创建完成后，本阶段继续实现 Role / Permission 的前端入口，并补充 API Client 的错误解析能力，让前端页面可以展示后端统一响应中的错误信息。

### 已完成事项

#### 1. Role / Permission 前端页面

新增：

- `apps/admin-web/src/modules/access/api.ts`
- `apps/admin-web/src/modules/access/pages/AccessControl.vue`

页面能力：

- 请求 `GET /api/roles` 获取角色列表。
- 请求 `GET /api/permissions` 获取权限列表。
- 展示角色数量、权限数量。
- 展示角色表格和权限表格。
- 展示部分权限 code 标签。

#### 2. 路由与菜单

调整：

- `apps/admin-web/src/router/index.ts`
- `apps/admin-web/src/router/menus.ts`
- `apps/admin-web/src/stores/permission.store.ts`

新增路由：

```text
/access
```

新增菜单：

```text
角色权限
```

新增前端权限码：

- `role:list:view`
- `permission:list:view`

#### 3. 国际化文案

调整：

- `apps/admin-web/src/locales/zh-CN.ts`
- `apps/admin-web/src/locales/en-US.ts`

新增：

- `nav.access`
- `access.*`
- `common.loadFailed`

#### 4. API Client 错误处理

调整：

- `packages/api-client/src/index.ts`

新增：

- `ApiClientError`
- Axios 响应错误拦截器

当前行为：

- 后端返回统一错误响应时，前端会抛出包含 `message`、`code`、`requestId` 的 `ApiClientError`。
- `AccessControl.vue` 加载失败时显示错误提示。

## 2026-06-18：修复布局滚动并补充角色权限弹窗

### 背景

用户反馈后台页面向下滚动时整个页面都会滚动，期望只有内容区域滚动。本阶段修复整体布局滚动行为，并继续补充 Role / Permission 页面的创建、编辑、授权基础交互。

### 已完成事项

#### 1. 后台布局滚动修复

调整：

- `apps/admin-web/src/styles/main.css`
- `apps/admin-web/src/layouts/AdminLayout.vue`

修复策略：

- `body` 与 `#app` 固定为 `height: 100vh`。
- `body` 与 `#app` 禁止全局滚动：`overflow: hidden`。
- 后台根布局使用 `h-screen overflow-hidden`。
- 侧边栏固定为视口高度。
- 顶部 header 从 sticky 改为普通固定高度区域。
- 内容区域使用 `h-[calc(100vh-5rem)] overflow-y-auto`。

当前效果：

- 页面整体不再跟随滚动。
- 只有右侧内容区域滚动。
- 左侧菜单和顶部栏保持稳定。

#### 2. Role / Permission 创建、编辑、授权弹窗

调整：

- `apps/admin-web/src/modules/access/api.ts`
- `apps/admin-web/src/modules/access/pages/AccessControl.vue`
- `apps/admin-web/src/locales/zh-CN.ts`
- `apps/admin-web/src/locales/en-US.ts`

新增 API：

- `createRoleApi`
- `updateRoleApi`
- `assignRolePermissionsApi`

新增交互：

- 新增角色弹窗
- 编辑角色弹窗
- 角色授权弹窗
- 权限多选
- 保存成功提示
- 授权成功提示

新增国际化文案：

- `access.actions.*`
- `access.form.*`
- `access.messages.*`
- `common.actions`

### 验证记录

已执行：

```bash
pnpm typecheck
pnpm build
```

结果：

- 类型检查通过：8 个 workspace 全部成功。
- 构建通过：8 个 workspace 全部成功。

已知提示：

- `naive` chunk 超过 500KB，属于 UI 库集中分包后的体积提示，不影响构建运行。

## 2026-06-18：租户上下文切换与 X-Tenant-Id 注入

### 背景

继续推进平台用户租户切换能力。平台用户需要可以在顶部切换当前查看的租户，前端后续请求自动携带 `X-Tenant-Id`，后端业务服务根据该上下文过滤数据。

### 已完成事项

#### 1. 前端租户上下文存储

调整：

- `packages/auth/src/index.ts`

新增：

- `getTenantContext()`
- `setTenantContext()`
- `clearTenantContext()`

租户上下文持久化 key：

```text
shop-saas-tenant-context
```

#### 2. API Client 注入 X-Tenant-Id

调整：

- `packages/api-client/src/index.ts`

当前行为：

- 请求时自动读取当前租户上下文。
- 如果存在租户 ID，则注入：`X-Tenant-Id: <tenantId>`。
- 如果选择全部租户，则不注入该 Header。

#### 3. 顶部租户切换器

新增：

- `apps/admin-web/src/modules/tenant/api.ts`
- `apps/admin-web/src/stores/tenant.store.ts`

调整：

- `apps/admin-web/src/layouts/AdminLayout.vue`
- `apps/admin-web/src/locales/zh-CN.ts`
- `apps/admin-web/src/locales/en-US.ts`

当前能力：

- 平台用户顶部显示租户切换器。
- 可选择“全部租户”或具体租户。
- 选择结果会持久化，并影响后续 API 请求。

#### 4. 后端租户上下文透传

调整：

- `apps/api-server/src/common/decorators/current-tenant.decorator.ts`
- `apps/api-server/src/modules/user/user.controller.ts`
- `apps/api-server/src/modules/user/user.service.ts`

当前策略：

- `CurrentTenantId` 优先读取 `x-tenant-id`。
- 没有 `x-tenant-id` 时回退到 JWT 中的用户 `tenantId`。
- 平台用户可通过 `X-Tenant-Id` 过滤指定租户用户。
- 租户用户不能越权访问其他租户。

#### 5. seed 示例租户与租户管理员

调整：

- `apps/api-server/prisma/seed.ts`

新增 seed 数据：

```text
租户：星河优选
code：star-market
状态：active
套餐：growth
```

新增租户管理员账号：

```text
账号：tenant_admin
密码：123456
角色：租户管理员
```

### 验证记录

已执行：

```bash
pnpm --filter @shop-saas/api-server prisma:seed
pnpm typecheck
pnpm build
```

结果：

- seed 成功。
- 类型检查通过：8 个 workspace 全部成功。
- 构建通过：8 个 workspace 全部成功。

## 2026-06-18：用户管理与租户管理接入真实 API

### 背景

继续推进后台核心管理页面真实数据接入。本阶段将用户管理页面接入 User API，并将租户管理页面从演示数据切换为 Tenant API。

### 已完成事项

#### 1. 用户管理页面

新增：

- `apps/admin-web/src/modules/user/api.ts`
- `apps/admin-web/src/modules/user/pages/UserManagement.vue`

新增路由：

```text
/users
```

调整：

- `apps/admin-web/src/router/index.ts`
- `apps/admin-web/src/router/menus.ts`
- `apps/admin-web/src/stores/permission.store.ts`

当前能力：

- 请求 `GET /api/users` 获取真实用户列表。
- 支持分页。
- 支持关键词搜索。
- 支持状态筛选。
- 支持新增用户。
- 支持编辑用户基础信息和状态。
- 用户列表会受到顶部租户上下文影响。

#### 2. 租户管理页面接入真实 API

调整：

- `apps/admin-web/src/modules/tenant/api.ts`
- `apps/admin-web/src/modules/tenant/pages/TenantOverview.vue`

当前能力：

- 请求 `GET /api/tenants` 获取真实租户列表。
- 支持分页。
- 支持关键词搜索。
- 支持状态筛选。
- 支持新增租户。

#### 3. 国际化文案

调整：

- `apps/admin-web/src/locales/zh-CN.ts`
- `apps/admin-web/src/locales/en-US.ts`

新增：

- `user.*`
- `tenant.status.*`
- `tenant.messages.created`
- 租户字段文案：code、phone、email

### 验证记录

已执行：

```bash
pnpm typecheck
pnpm build
```

结果：

- 类型检查通过：8 个 workspace 全部成功。
- 构建通过：8 个 workspace 全部成功。

## 2026-06-18：用户角色分配能力

### 背景

用户管理页面已经接入真实 API，本阶段继续补充用户角色分配能力，让平台管理员和租户管理员可以为用户绑定角色。

### 已完成事项

#### 1. 后端用户角色分配接口

调整：

- `apps/api-server/src/modules/user/dto/user.dto.ts`
- `apps/api-server/src/modules/user/user.controller.ts`
- `apps/api-server/src/modules/user/user.service.ts`

新增 DTO：

- `AssignUserRolesDto`

新增接口：

```text
POST /api/users/:id/roles
```

权限码：

```text
user:role:assign
```

当前策略：

- 分配角色前会校验目标用户租户归属。
- 租户用户只能为本租户用户分配本租户角色。
- 平台用户可分配平台/租户角色。

#### 2. 用户列表返回角色信息

调整：

- `apps/api-server/src/modules/user/user.service.ts`

用户列表现在返回：

- `userRoles.role`

前端可展示用户当前角色。

#### 3. 前端用户角色分配弹窗

调整：

- `apps/admin-web/src/modules/user/api.ts`
- `apps/admin-web/src/modules/user/pages/UserManagement.vue`

新增 API：

- `assignUserRolesApi`

新增交互：

- 用户表格展示角色列。
- 用户操作区新增“分配角色”。
- 分配角色弹窗。
- 角色多选。
- 保存后刷新用户列表。

#### 4. 国际化文案

调整：

- `apps/admin-web/src/locales/zh-CN.ts`
- `apps/admin-web/src/locales/en-US.ts`

新增：

- `user.columns.roles`
- `user.actions.assignRoles`
- `user.form.roles`
- `user.messages.assigned`

#### 5. seed 权限补充

调整：

- `apps/api-server/prisma/seed.ts`

新增权限码：

```text
user:role:assign
```

### 验证记录

已执行：

```bash
pnpm --filter @shop-saas/api-server prisma:seed
pnpm typecheck
pnpm build
```

结果：

- seed 成功。
- 类型检查通过：8 个 workspace 全部成功。
- 构建通过：8 个 workspace 全部成功。

## 2026-06-18：租户编辑、状态变更和初始化管理员

### 背景

用户管理和角色分配能力完成后，本阶段继续完善租户生命周期管理，补充租户编辑、启用/禁用和初始化租户管理员流程。

### 已完成事项

#### 1. 后端初始化租户管理员接口

调整：

- `apps/api-server/src/modules/tenant/dto/create-tenant.dto.ts`
- `apps/api-server/src/modules/tenant/tenant.controller.ts`
- `apps/api-server/src/modules/tenant/tenant.service.ts`

新增 DTO：

- `InitTenantAdminDto`

新增接口：

```text
POST /api/tenants/:id/admin
```

权限码：

```text
tenant:admin:init
```

当前能力：

- 为指定租户创建租户管理员账号。
- 自动确保租户管理员角色 `tenant_admin` 存在。
- 自动给新管理员绑定租户管理员角色。
- 密码使用 argon2 哈希存储。

#### 2. 租户前端 API 补充

调整：

- `apps/admin-web/src/modules/tenant/api.ts`

新增：

- `updateTenantApi`
- `initTenantAdminApi`
- `UpdateTenantPayload`
- `InitTenantAdminPayload`

#### 3. 租户管理页面交互完善

调整：

- `apps/admin-web/src/modules/tenant/pages/TenantOverview.vue`

新增交互：

- 编辑租户弹窗。
- 启用 / 禁用租户。
- 初始化租户管理员弹窗。
- 初始化管理员默认账号根据租户 code 生成。
- 保存成功、初始化成功提示。

#### 4. 前端权限码补充

调整：

- `apps/admin-web/src/router/menus.ts`
- `apps/admin-web/src/stores/permission.store.ts`
- `apps/api-server/prisma/seed.ts`

新增权限码：

```text
tenant:update:submit
tenant:admin:init
```

#### 5. 国际化文案补充

调整：

- `apps/admin-web/src/locales/zh-CN.ts`
- `apps/admin-web/src/locales/en-US.ts`

新增：

- `tenant.actions.*`
- `tenant.admin.defaultName`
- `tenant.messages.updated`
- `tenant.messages.adminInitialized`

### 验证记录

已执行：

```bash
pnpm --filter @shop-saas/api-server prisma:seed
pnpm typecheck
pnpm build
```

结果：

- seed 成功。
- 类型检查通过：8 个 workspace 全部成功。
- 构建通过：8 个 workspace 全部成功。

## 2026-06-18：后端错误码与前端 i18n 文案联动

### 背景

后端已经统一返回错误码与错误消息，本阶段将前端页面的错误展示改为优先根据后端错误码映射本地化文案，避免中文后端消息直接显示在英文界面中。

### 已完成事项

#### 1. 错误码本地化工具

新增：

- `apps/admin-web/src/utils/error-message.ts`

能力：

- 识别 `ApiClientError`。
- 根据后端 `code` 映射前端 i18n key。
- 未识别错误时回退到默认错误文案。

当前错误码映射：

| code | i18n key |
| --- | --- |
| 40000 | `errors.badRequest` |
| 40001 | `errors.unauthorized` |
| 40003 | `errors.forbidden` |
| 40004 | `errors.notFound` |
| 40009 | `errors.conflict` |
| 40100 | `errors.tenantUnavailable` |
| 50000 | `errors.serverError` |

#### 2. 国际化错误文案

调整：

- `apps/admin-web/src/locales/zh-CN.ts`
- `apps/admin-web/src/locales/en-US.ts`

新增：

- `errors.badRequest`
- `errors.unauthorized`
- `errors.forbidden`
- `errors.notFound`
- `errors.conflict`
- `errors.tenantUnavailable`
- `errors.serverError`
- `errors.unknown`

#### 3. 页面错误提示替换

调整：

- `apps/admin-web/src/modules/auth/pages/AuthLogin.vue`
- `apps/admin-web/src/modules/tenant/pages/TenantOverview.vue`
- `apps/admin-web/src/modules/user/pages/UserManagement.vue`
- `apps/admin-web/src/modules/access/pages/AccessControl.vue`

当前页面错误提示统一使用：

```ts
resolveErrorMessage(error)
```

### 验证记录

已执行：

```bash
pnpm typecheck
pnpm build
```

结果：

- 类型检查通过：8 个 workspace 全部成功。
- 构建通过：8 个 workspace 全部成功。

## 2026-06-18：修复新增租户报错与提交错误提示缺失

### 背景

用户反馈两个问题：

1. 新增租户接口报错：

```text
property status should not exist
```

2. 接口出错时前端没有任何提示。

### 已完成事项

#### 1. 修复新增租户 status 字段被拦截

调整：

- `apps/api-server/src/modules/tenant/dto/create-tenant.dto.ts`
- `apps/api-server/src/modules/tenant/tenant.service.ts`

后端原因：

- 全局 `ValidationPipe` 启用 `forbidNonWhitelisted`。
- `CreateTenantDto` 没有声明 `status` 字段，前端传入的 `status` 被拒绝。

修复方式：

- 为 `CreateTenantDto` 增加可选 `status` 字段。
- `TenantService.create` 对 status 做枚举映射。

调整：

- `apps/admin-web/src/modules/tenant/api.ts`：`CreateTenantPayload` 新增可选 `status`。

#### 2. 补充页面提交错误提示

调整：

- `apps/admin-web/src/modules/tenant/pages/TenantOverview.vue`
- `apps/admin-web/src/modules/user/pages/UserManagement.vue`
- `apps/admin-web/src/modules/access/pages/AccessControl.vue`

之前 `saveTenant`、`saveTenantAdmin`、`toggleTenantStatus`、`saveUser`、`saveUserRoles`、`saveRole`、`saveRolePermissions` 等函数没有 `try/catch`，接口报错时没有用户提示。

现在统一使用：

```ts
try {
  // ...
} catch (error) {
  message.error(resolveErrorMessage(error))
}
```

### 验证记录

已执行：

```bash
pnpm typecheck
pnpm build
```

结果：

- 类型检查通过：8 个 workspace 全部成功。
- 构建通过：8 个 workspace 全部成功。

## 2026-06-18：用户重置密码与通用 PageHero 组件

### 背景

继续推进上一阶段提出的开发计划：

- 用户管理页增加重置密码功能。
- 抽象通用 PageHero 页面头部组件。

### 已完成事项

#### 1. 后端重置密码接口

调整：

- `apps/api-server/src/modules/user/dto/user.dto.ts`
- `apps/api-server/src/modules/user/user.controller.ts`
- `apps/api-server/src/modules/user/user.service.ts`
- `apps/api-server/prisma/seed.ts`

新增 DTO：

- `ResetUserPasswordDto`

新增接口：

```text
POST /api/users/:id/password
```

权限码：

```text
user:password:reset
```

当前能力：

- 使用 argon2 哈希新密码。
- 校验租户上下文，租户用户只能重置同租户用户的密码。
- 平台用户可重置任意用户密码。

#### 2. 前端重置密码弹窗

调整：

- `apps/admin-web/src/modules/user/api.ts`
- `apps/admin-web/src/modules/user/pages/UserManagement.vue`
- `apps/admin-web/src/router/menus.ts`
- `apps/admin-web/src/stores/permission.store.ts`

新增 API：

- `resetUserPasswordApi`

新增交互：

- 用户操作列新增“重置密码”按钮。
- 弹出密码输入弹窗。
- 默认值为 `123456`。
- 提交成功显示提示。

#### 3. 通用 PageHero 页面头部组件

新增：

- `apps/admin-web/src/components/PageHero.vue`

能力：

- 接受 `eyebrow`、`title`、`description`。
- 可选 metric 区块，支持 indigo / slate / emerald 三种主色。
- 提供 `extra` 与 `metric` 插槽用于扩展。

调整：

- `apps/admin-web/src/modules/tenant/pages/TenantOverview.vue`
- `apps/admin-web/src/modules/user/pages/UserManagement.vue`
- `apps/admin-web/src/modules/access/pages/AccessControl.vue`

当前租户、用户、角色权限页面统一使用 PageHero 渲染头部，移除重复的标题 + 指标卡布局。

#### 4. 国际化文案补充

调整：

- `apps/admin-web/src/locales/zh-CN.ts`
- `apps/admin-web/src/locales/en-US.ts`

新增：

- `user.actions.resetPassword`
- `user.messages.passwordReset`

#### 5. 权限码补充

新增前端权限码并写入 seed：

- `user:create:submit`
- `user:update:submit`
- `user:role:assign`
- `user:password:reset`

### 待验证

下一步执行：

```bash
pnpm --filter @shop-saas/api-server prisma:seed
pnpm typecheck
pnpm build
```

### 后续计划

下一步建议：

1. 抽象通用 SearchForm、DataTable 包装组件。
2. 完善租户套餐、到期时间字段管理。
3. 增加操作日志记录中间件。
4. 商品中心建立后，开始打通订单中心基础接口。

## 2026-06-18：商品中心基础模型与页面骨架

### 背景

继续推进上一阶段计划：搭建商品中心数据模型、后端 API 和前端页面骨架，为后续订单/库存模块打基础。

### 已完成事项

#### 1. Prisma 商品中心模型

调整：

- `apps/api-server/prisma/schema.prisma`

新增模型：

- `ProductCategory`
- `Product`

新增枚举：

- `ProductStatus`: `draft` / `on_sale` / `off_sale` / `archived`

均带有 `tenantId` 字段并加索引，`Product` 在 `tenantId + code` 上加唯一约束。

已执行：

```bash
pnpm --filter @shop-saas/api-server prisma:push
```

数据库已同步。

#### 2. 后端 ProductModule

新增：

- `apps/api-server/src/modules/product/dto/product.dto.ts`
- `apps/api-server/src/modules/product/product.service.ts`
- `apps/api-server/src/modules/product/product.controller.ts`
- `apps/api-server/src/modules/product/product.module.ts`

调整：

- `apps/api-server/src/app.module.ts`

新增接口：

```text
GET    /api/products/categories
POST   /api/products/categories
PATCH  /api/products/categories/:id
DELETE /api/products/categories/:id

GET    /api/products
GET    /api/products/:id
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
```

权限码：

```text
product:list:view
product:create:submit
product:update:submit
product:delete:submit
product:category:submit
```

所有接口都受租户上下文影响：

- 平台用户：必须选择具体租户上下文才能创建商品/分类。
- 租户用户：自动绑定到自身 `tenantId`。

#### 3. seed 权限补充

调整：

- `apps/api-server/prisma/seed.ts`

新增权限：

```text
product:list:view
product:create:submit
product:update:submit
product:delete:submit
product:category:submit
```

#### 4. 前端商品中心页面

新增：

- `apps/admin-web/src/modules/product/api.ts`
- `apps/admin-web/src/modules/product/pages/ProductCenter.vue`

调整：

- `apps/admin-web/src/router/index.ts`
- `apps/admin-web/src/router/menus.ts`
- `apps/admin-web/src/stores/permission.store.ts`

新增路由：

```text
/products
```

商品菜单已指向真实页面 `/products`。

页面能力：

- 顶部使用 `PageHero` 渲染商品中心信息
- 分类管理区块：新增、编辑、删除
- 商品列表区块：搜索、分页、状态/分类筛选、新增、编辑、删除
- 主图占位
- 价格、库存、状态列
- 错误统一通过 `resolveErrorMessage` 提示

#### 5. 国际化文案

调整：

- `apps/admin-web/src/locales/zh-CN.ts`
- `apps/admin-web/src/locales/en-US.ts`

新增：

- `product.*` 全套文案
- 中英文齐全

### 待验证

下一步执行：

```bash
pnpm typecheck
pnpm build
```

结果：

- 类型检查通过：8 个 workspace 全部成功。
- 构建通过：8 个 workspace 全部成功。

## 2026-06-22：商品中心拆分、多级菜单与租户切换刷新

### 背景

用户提出三个问题：

1. 菜单是否支持多级菜单？
2. 商品中心后续菜单和商品希望分开两个菜单。
3. 切换租户时，当前所在页面没有任何变化，数据并不是当前所选的租户数据。

### 已完成事项

#### 1. 商品中心拆分为两个页面

将原来的 `ProductCenter.vue` 拆分为两个独立页面：

- `ProductList.vue`：商品列表管理
- `ProductCategory.vue`：商品分类管理

删除：

- `apps/admin-web/src/modules/product/pages/ProductCenter.vue`

调整：

- `apps/admin-web/src/router/index.ts`

新增路由：

```text
/products          -> 重定向到 /products/list
/products/list     -> ProductList
/products/categories -> ProductCategory
```

#### 2. 多级菜单支持

调整：

- `apps/admin-web/src/router/menus.ts`
- `apps/admin-web/src/stores/permission.store.ts`
- `apps/admin-web/src/layouts/AdminLayout.vue`

菜单结构改为支持 `children` 嵌套：

```ts
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
}
```

`usePermissionStore.menus` 改为递归过滤：

```ts
function filterMenus(menus, permissions) {
  return menus
    .map((menu) => {
      if (!permissions.includes(menu.permission)) return null
      if (menu.children?.length) {
        const children = filterMenus(menu.children, permissions)
        if (!children.length) return null
        return { ...menu, children }
      }
      return menu
    })
    .filter(Boolean)
}
```

`AdminLayout` 菜单渲染改为递归生成 `MenuOption`：

```ts
function toMenuOption(menu): MenuOption {
  const hasChildren = Boolean(menu.children?.length)
  return {
    label: hasChildren ? t(menu.titleKey) : ...,
    key: menu.key,
    icon: ...,
    children: hasChildren ? menu.children!.map(toMenuOption) : undefined
  }
}
```

新增菜单高亮路径匹配：

```ts
function findMenuKeyByPath(menus, path): string | null {
  // 递归查找当前路径对应的菜单 key
}
```

#### 3. 租户切换后页面刷新

调整：

- `apps/admin-web/src/layouts/AdminLayout.vue`

问题：

- 切换租户后，`RouterView` 不会重新挂载当前页面组件
- 页面数据仍是旧租户的

解决方式：

- `RouterView` 绑定 `:key="routeKey"`
- `routeKey` 组合 `route.fullPath` + `tenantStore.currentTenantId`
- 当租户 ID 变化时，`key` 变化，组件重新挂载
- 组件 `onMounted` 重新拉取数据

```ts
const routeKey = computed(
  () => `${route.fullPath}::${tenantStore.currentTenantId || 'all'}`
)
```

```vue
<RouterView :key="routeKey" />
```

租户切换处理：

```ts
function onTenantChange(tenantId: string) {
  tenantStore.setCurrentTenant(tenantId)
}
```

不需要额外的 `watch` 逻辑，因为 `RouterView` 的 `key` 变化会触发组件重新挂载，`onMounted` 会重新执行。

#### 4. 国际化补充

调整：

- `apps/admin-web/src/locales/zh-CN.ts`
- `apps/admin-web/src/locales/en-US.ts`

新增：

- `common.loading`
- `nav.productList`
- `nav.productCategories`
- `product.listTitle`
- `product.listDescription`
- `product.categoryTitle`
- `product.categoryDescription`
- `product.categorySummary`
- `product.categorySummaryTip`

### 验证记录

已执行：

```bash
pnpm typecheck
pnpm build
```

结果：

- 类型检查通过：8 个 workspace 全部成功。
- 构建通过：8 个 workspace 全部成功。

### 后续计划

下一步建议：

1. 抽象通用 SearchForm、DataTable 包装组件。
2. 完善租户套餐、到期时间字段管理。
3. 增加操作日志记录中间件。
4. 商品中心订单/库存模型基础。
5. 商品图片多图上传与详情富文本。

## 2026-06-25：日志系统与前端体验优化

### 背景

继续推进系统完善，本阶段重点实现应用日志、操作日志、登录日志功能，并优化前端体验。

### 已完成事项

#### 1. 应用日志（pino）

新增依赖：

```bash
pnpm --filter @shop-saas/api-server add nestjs-pino pino-http
pnpm --filter @shop-saas/api-server add -D pino-pretty
```

新增：

- `apps/api-server/src/common/logger/app-logger.module.ts`

调整：

- `apps/api-server/src/app.module.ts`：注册 `AppLoggerModule`
- `apps/api-server/src/main.ts`：切换为 pino logger

能力：

- 开发环境：pino-pretty 彩色单行日志
- 生产环境：JSON 结构化日志
- 复用 request-id 中间件的 ID
- 健康检查、Swagger 路径不打访问日志
- 5xx 打完整堆栈，4xx 只 warn 一行

#### 2. 操作日志基础设施

新增：

- `apps/api-server/src/common/audit/audit-log.decorator.ts`：`@AuditLog()` 装饰器
- `apps/api-server/src/common/audit/audit-log.service.ts`：日志写入服务
- `apps/api-server/src/common/audit/audit-log.interceptor.ts`：全局拦截器
- `apps/api-server/src/common/audit/audit.module.ts`：AuditModule

能力：

- 装饰器标记需要记录操作日志的路由
- 拦截器自动记录成功/失败，包含耗时 ms
- 自动从路径取 targetId，否则取响应体的 `id`
- **fire-and-forget**：写库失败不影响业务
- `password/token/secret/authorization/cookie` 字段自动掩码
- 序列化 payload，超过 2KB 截断

已贴 `@AuditLog` 的路由：

| 模块 | actions |
|------|---------|
| tenant | create / update / renew / init-admin / delete |
| user | create / update / assign-roles / reset-password |
| role | create / update / assign-permissions |
| product | create / update / delete / create-category / update-category / delete-category |
| order | create / update-status / ship / cancel |

#### 3. Prisma 模型增强

调整：

- `apps/api-server/prisma/schema.prisma`

OperationLog 新增字段：

- `account`：操作账号
- `targetId`：业务对象 ID
- `payload`：请求摘要（JSON）
- `message`：失败时的错误消息
- `durationMs`：接口耗时（毫秒）
- `requestId`：请求 ID
- `userAgent`：User-Agent

LoginLog 新增字段：

- `message`：失败原因
- `requestId`：请求 ID

已执行：

```bash
pnpm --filter @shop-saas/api-server prisma:push
```

#### 4. 登录日志记录

调整：

- `apps/api-server/src/modules/auth/auth.service.ts`
- `apps/api-server/src/modules/auth/auth.controller.ts`

在 success、账号不存在、密码错误三个分支都 `recordLogin()`，并接收 `LoginContext` (IP/UA/RequestId)。

#### 5. 日志查询接口

新增：

- `apps/api-server/src/modules/audit-log/audit-log-query.service.ts`
- `apps/api-server/src/modules/audit-log/audit-log.controller.ts`
- `apps/api-server/src/modules/audit-log/audit-log.module.ts`
- `apps/api-server/src/modules/audit-log/dto/audit-log.dto.ts`

接口：

- `GET /api/audit-logs/operations`：操作日志列表（分页、模块/动作/账号/关键词/时间区间过滤）
- `GET /api/audit-logs/operations/stats`：操作日志统计（total / failures / last24h）
- `GET /api/audit-logs/logins`：登录日志列表（分页、账号/结果/时间区间过滤）
- `POST /api/audit-logs/cleanup`：手动触发日志清理（仅供调试）

租户用户自动隔离到 `tenantId`，平台用户看全局。

#### 6. 日志清理 Cron

新增：

- `apps/api-server/src/modules/audit-log/audit-log-cleanup.service.ts`

能力：

- `@Cron('0 3 * * *')` 每天凌晨 3 点跑（避开 2 点的租户过期 cron）
- 分批 1000 条删除避免锁表
- 可通过 `AUDIT_LOG_RETENTION_DAYS` / `LOGIN_LOG_RETENTION_DAYS` 环境变量调整保留天数（默认 90，0 关闭）

#### 7. 前端审计日志页面

新增：

- `apps/admin-web/src/modules/audit/api.ts`
- `apps/admin-web/src/modules/audit/pages/OperationLogPage.vue`
- `apps/admin-web/src/modules/audit/pages/LoginLogPage.vue`

调整：

- `apps/admin-web/src/router/index.ts`
- `apps/admin-web/src/router/menus.ts`
- `apps/admin-web/src/stores/permission.store.ts`

路由：

- `/audit/operations`：操作日志
- `/audit/logins`：登录日志

菜单：

- 审计日志（父菜单）
  - 操作日志
  - 登录日志

页面能力：

- 操作日志：顶部三个指标卡（总数/24h/失败），表格 + 搜索（关键词/模块/结果），详情抽屉展示完整信息 + 格式化 payload JSON
- 登录日志：时间/账号/IP/UA/结果，按账号过滤

#### 8. 权限种子补充

新增权限码：

```text
audit:operation:view
audit:login:view
audit:cleanup:submit
```

#### 9. 前端错误提示优化

调整：

- `apps/admin-web/src/utils/error-message.ts`

策略调整：

- 401（登录失效）和 500（内部错误）强制使用本地化文案
- 其他情况**优先**返回后端 message（业务上下文最准）
- 后端没给 message 时再按 code 套兜底翻译

#### 10. Token 自动刷新

调整：

- `packages/api-client/src/index.ts`
- `apps/admin-web/src/main.ts`
- `apps/api-server/src/modules/auth/auth.service.ts`
- `apps/api-server/src/modules/auth/auth.controller.ts`

能力：

- 前端 401 → 静默调 refresh → 拿到新对 token → 重放原请求 → 用户无感
- 单飞 refresh：并发 401 只触发一次刷新
- refresh 失败 → 清状态 + 跳登录页（携带 `redirect`）
- refresh 成功 → 同步新 user 到 store（保证权限变更立即生效）
- 后端 refresh 实现：验证签名 + 回库重查用户权限 + 轮换 refresh token

#### 11. 前端暗色模式修复

调整：

- `apps/admin-web/src/layouts/AdminLayout.vue`

修复：

- 侧边栏和 header 的暗色背景被亮色背景覆盖
- 侧边栏文字颜色在暗色下太浅
- Tailwind 配置 `darkMode: 'class'`

#### 12. DataTable 分页总数显示

调整：

- `apps/admin-web/src/components/DataTable.vue`
- 所有使用 DataTable 的页面

修复：

- 添加 `:remote="true"` 让 Naive UI 使用 `itemCount` 而非 `data.length`
- 添加 `@change` 事件处理每页数量切换
- 所有列表页右下角显示"共 X 条"

#### 13. 新增用户 status 字段修复

调整：

- `packages/schemas/src/user.ts`

修复：`CreateUserSchema` 增加可选 `status` 字段，避免前端提交时被 Zod strict 模式拒绝。

#### 14. 页面总数显示

调整：

- 所有列表页（订单/商品/租户/用户/操作日志/登录日志/角色权限）

在每个列表页标题下方显示"· 共 X 条"。

### 验证记录

已执行：

```bash
pnpm --filter @shop-saas/api-server prisma:seed
pnpm typecheck
pnpm build
```

结果：

- seed 成功
- 类型检查通过
- 构建通过

### 后续计划

下一步建议：

1. 订单履约模块开发
2. 系统设置模块开发
3. 动态菜单（后端返回用户可访问的菜单列表）
4. 数据权限（按部门、按创建人、按店铺等维度控制数据范围）
5. 租户套餐管理
6. Token 刷新完善
7. 文件上传能力（商品图片、用户头像等）
8. 富文本编辑（商品详情）

## 2026-06-22：抽象通用 SearchForm 和 DataTable 组件

### 背景

现有页面（用户管理、租户管理、商品列表等）都有相似的搜索表单和数据表格实现，代码重复度高。需要抽象通用组件提升开发效率和代码一致性。

### 已完成事项

#### 1. SearchForm 搜索表单组件

新增：

- `apps/admin-web/src/components/SearchForm.vue`

能力：

- 支持动态表单字段配置（`input` / `select` 类型）
- 支持 v-model 双向绑定查询参数
- 支持搜索、重置按钮
- 支持加载状态
- 支持 Enter 键搜索

使用示例：

```vue
<SearchForm
  v-model="query"
  :fields="searchFields"
  :loading="loading"
  @search="handleSearch"
  @reset="handleReset"
/>
```

#### 2. DataTable 数据表格组件

新增：

- `apps/admin-web/src/components/DataTable.vue`

能力：

- 支持列配置
- 支持分页（默认配置）
- 支持加载状态
- 支持空状态提示
- 支持自定义 rowKey

使用示例：

```vue
<DataTable
  :columns="columns"
  :data="users"
  :loading="loading"
  :pagination="{
    page: query.page,
    pageSize: query.pageSize,
    itemCount: total,
    onChange: (page) => { query.page = page; loadUsers() }
  }"
/>
```

#### 3. 重构用户管理页面

调整：

- `apps/admin-web/src/modules/user/pages/UserManagement.vue`

将原有的搜索表单和表格替换为通用组件：

- 使用 `SearchForm` 替换手动编写的搜索表单
- 使用 `DataTable` 替换 `NDataTable`
- 代码量减少约 30%
- 搜索和重置逻辑更清晰

#### 4. 国际化补充

调整：

- `apps/admin-web/src/locales/zh-CN.ts`
- `apps/admin-web/src/locales/en-US.ts`

新增：

- `user.columns.keyword`

### 验证记录

已执行：

```bash
pnpm typecheck
pnpm build
```

结果：

- 类型检查通过：8 个 workspace 全部成功。
- 构建通过：8 个 workspace 全部成功。

### 后续计划

下一步建议：

1. 将其他页面（租户管理、商品列表、角色权限等）也重构为使用通用组件。
2. 完善租户套餐、到期时间字段管理。
3. 增加操作日志记录中间件。
4. 商品中心订单/库存模型基础。
5. 商品图片多图上传与详情富文本。
