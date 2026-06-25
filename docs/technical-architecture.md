# 技术架构设计文档

> 版本：v0.1  
> 项目：商城 SaaS 重构项目  
> 目标：为后续全栈、多端、多角色、多租户系统开发提供统一技术架构约定

## 1. 架构结论

本项目后续采用 **monorepo 架构** 进行完全重构，不再基于当前旧文件直接改造。

前端核心技术栈确定为：

- Vite
- Vue 3
- TypeScript
- Tailwind CSS
- Pinia
- Vue Router

包管理与工程组织建议采用：

- pnpm workspace
- Turborepo，可选但推荐

后端技术栈确定为：

- Node.js
- TypeScript
- NestJS
- MySQL
- Prisma，推荐
- Redis，可选但建议预留

UI 组件库确定为：

- PC 管理后台：Naive UI + Tailwind CSS
- 移动 H5：Vant + Tailwind CSS，建议
- 高度定制化页面：Tailwind CSS + Headless 组件

## 2. 为什么选择 monorepo

当前项目升级目标是全栈、多端、多角色、多租户系统，后续会包含多个应用与多个共享模块。

如果继续使用单体前端结构，随着平台后台、租户后台、商城 H5、移动管理端、小程序、后端服务的加入，代码会逐渐混乱，公共逻辑也难以复用。

monorepo 更适合本项目的原因：

- 多端应用可以独立开发、独立构建、独立部署。
- 公共类型、请求 SDK、工具函数、权限逻辑可以统一复用。
- 前后端可以共享 TypeScript 类型和业务枚举。
- 更适合长期维护和多人协作。
- 后续扩展 H5、小程序、移动端、开放 SDK 更自然。
- 更适合 SaaS 系统的模块化演进。

## 3. 总体目录结构

推荐最终目录结构：

```text
shop-saas
├── apps
│   ├── admin-web               # PC 管理后台，初期包含平台后台 + 租户后台
│   ├── api-server              # 后端 API 服务
│   ├── shop-h5                 # 消费者 H5 商城，第二阶段建设
│   ├── mobile-admin            # 移动管理端，第二/三阶段建设
│   └── shop-miniapp            # 小程序端，可选
│
├── packages
│   ├── api-client              # 前端请求 SDK
│   ├── auth                    # 认证、Token、权限辅助逻辑
│   ├── config                  # 共享工程配置
│   ├── constants               # 常量、枚举、业务字典
│   ├── shared                  # 通用工具函数
│   ├── types                   # 前后端共享类型
│   └── ui                      # 通用 UI 组件，可选
│
├── docs                        # 项目文档
├── scripts                     # 工程脚本
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

## 4. 第一阶段推荐落地结构

第一阶段不建议一次性创建所有端，避免过度架构。

建议先落地：

```text
shop-saas
├── apps
│   ├── admin-web
│   └── api-server
│
├── packages
│   ├── api-client
│   ├── auth
│   ├── config
│   ├── constants
│   ├── shared
│   └── types
│
└── docs
```

第一阶段重点是：

- 建立 monorepo 基础工程。
- 搭建 PC 管理后台。
- 搭建后端 API 服务。
- 建立租户、用户、角色、权限基础模型。
- 建立统一认证与接口规范。
- 建立共享类型和业务枚举。

## 5. 应用划分

### 5.1 apps/admin-web

PC 管理后台。

第一阶段同时承载：

- 平台管理后台
- 租户管理后台

不建议第一阶段拆成 `platform-admin` 和 `tenant-admin` 两个应用，原因是二者同属 PC 后台，布局、表格、表单、权限、菜单、请求封装高度相似。

后续当平台后台和租户后台差异明显变大时，再拆分为：

```text
apps
├── platform-admin
└── tenant-admin
```

### 5.2 apps/api-server

后端 API 服务。

负责：

- 认证授权
- 租户管理
- 用户管理
- 角色权限
- 商品中心
- 订单中心
- 库存中心
- 售后中心
- 财务中心
- 数据统计
- 系统设置
- 文件上传
- 操作日志

### 5.3 apps/shop-h5

消费者 H5 商城。

建议第二阶段或第三阶段建设。

负责：

- 首页
- 商品分类
- 商品详情
- 购物车
- 下单支付
- 订单中心
- 售后申请
- 会员中心

### 5.4 apps/mobile-admin

移动管理端。

负责：

- 移动工作台
- 待处理订单
- 销售数据
- 库存预警
- 消息通知
- 快捷操作

### 5.5 apps/shop-miniapp

小程序端，可选。

如果需要小程序，建议后续单独选型：

- uni-app
- Taro
- 原生微信小程序

## 6. 前端技术栈

### 6.1 基础技术

PC 管理后台建议使用：

```text
Vite + Vue 3 + TypeScript + Tailwind CSS
```

配套工具：

- Vue Router：路由管理
- Pinia：状态管理
- Axios：HTTP 请求
- ECharts：图表
- VueUse：常用组合式工具
- unplugin-auto-import：自动导入
- unplugin-vue-components：组件自动导入

### 6.2 状态管理

推荐使用 Pinia。

建议拆分 store：

```text
stores
├── auth.ts             # 登录态、Token、当前用户
├── tenant.ts           # 当前租户、租户切换
├── permission.ts       # 权限、菜单、按钮权限
├── app.ts              # 主题、布局、全局设置
└── tabs.ts             # 多标签页，可选
```

### 6.3 路由设计

后台路由建议分为：

```text
routes
├── constant-routes.ts  # 登录、错误页等固定路由
├── platform-routes.ts  # 平台后台路由
├── tenant-routes.ts    # 租户后台路由
└── dynamic-routes.ts   # 后端权限返回的动态路由
```

路由层需要实现：

- 登录校验
- Token 校验
- 租户状态校验
- 角色权限校验
- 动态菜单生成
- 页面标题更新
- 404 / 403 处理

### 6.4 请求层设计

请求层建议统一封装在 `packages/api-client`。

需要支持：

- baseURL 配置
- Token 注入
- tenantId 注入
- refresh token
- 统一错误处理
- 统一响应格式
- 请求取消
- 文件上传
- 下载文件
- 接口类型提示

统一响应格式建议：

```ts
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  requestId: string
}
```

分页格式建议：

```ts
export interface PageResult<T> {
  list: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}
```

## 7. UI 组件库选型

你希望 UI 好看，同时项目又是后台 SaaS 系统，因此 UI 库需要同时满足：

- 视觉现代
- Vue 3 支持成熟
- TypeScript 类型完善
- 表格、表单、弹窗、上传、日期选择等后台组件完整
- 主题定制能力好
- 与 Tailwind CSS 不冲突
- 长期维护稳定

### 7.1 最终方案：Naive UI + Tailwind CSS

PC 管理后台确定使用：

```text
Naive UI + Tailwind CSS
```

推荐原因：

- 默认视觉比 Element Plus 更现代。
- Vue 3 和 TypeScript 支持较好。
- 组件完整，适合管理后台。
- 暗色主题支持优秀。
- 主题定制能力强。
- 与 Tailwind CSS 配合自然。
- 适合做比较精致的 SaaS 后台。

适合场景：

- 平台后台
- 租户后台
- SaaS 控制台
- 数据看板
- 表单和表格密集型系统

建议使用方式：

- Naive UI 负责复杂业务组件：表格、表单、弹窗、树、日期选择、上传、分页等。
- Tailwind CSS 负责布局、间距、响应式、卡片、颜色微调和自定义页面效果。

### 7.2 备选方案：Element Plus + Tailwind CSS

Element Plus 是后台系统中最稳妥的选择之一。

优点：

- 生态成熟。
- 中文资料多。
- 后台组件完整。
- 当前旧项目已经使用 Element Plus，迁移认知成本低。

缺点：

- 默认视觉相对常见，容易显得传统。
- 想做得好看需要更多主题和样式定制。

适合场景：

- 追求稳定和开发效率。
- 团队熟悉 Element Plus。
- 对视觉要求不是最高。

### 7.3 备选方案：Ant Design Vue

Ant Design Vue 更偏企业中后台风格。

优点：

- 企业后台风格成熟。
- 表格、表单、布局能力强。
- 设计规范完整。

缺点：

- 视觉风格偏重，和 Tailwind 的轻量自定义风格不一定完全匹配。
- Vue 生态热度不如 React 版 Ant Design。

适合场景：

- 企业管理系统。
- 强规范、强表单、强表格后台。

### 7.4 备选方案：shadcn-vue + Tailwind CSS

shadcn-vue 视觉效果非常现代，和 Tailwind CSS 高度匹配。

优点：

- 视觉好看，现代感强。
- 基于 Tailwind，定制能力非常强。
- 组件代码可控，不是传统黑盒组件库。
- 适合做高品质 SaaS 控制台。

缺点：

- 后台复杂组件不如 Naive UI / Element Plus 完整。
- 表格、复杂表单、上传、树、级联选择等需要更多组合或补充库。
- 开发成本较高。

适合场景：

- 追求高级视觉和强定制。
- 有足够时间打磨 UI。
- 后台不是特别依赖复杂表格组件，或愿意组合 TanStack Table 等工具。

### 7.5 UI 库最终结论

综合本项目目标，确定第一阶段使用：

```text
PC 管理后台：Naive UI + Tailwind CSS
移动 H5：Vant + Tailwind CSS
自定义营销页/官网页：Tailwind CSS + Headless 组件
```

移动 H5 使用 Vant 作为推荐方案；自定义营销页、官网页或局部高定制页面可以使用 Tailwind CSS + Headless 组件。

如果后续有极致视觉和独特设计诉求，可以在局部页面评估：

```text
shadcn-vue + Tailwind CSS
```

但第一阶段复杂后台系统的主 UI 库已确定为 Naive UI。

## 8. admin-web 内部目录结构

推荐结构：

```text
apps/admin-web
├── src
│   ├── app                 # 应用初始化
│   ├── assets              # 静态资源
│   ├── components          # 应用级公共组件
│   ├── layouts             # 布局
│   ├── modules             # 业务模块
│   │   ├── auth
│   │   ├── dashboard
│   │   ├── tenant
│   │   ├── user
│   │   ├── role
│   │   ├── permission
│   │   ├── product
│   │   ├── order
│   │   ├── after-sale
│   │   ├── finance
│   │   └── system
│   ├── router              # 路由
│   ├── stores              # Pinia 状态
│   ├── styles              # 全局样式
│   ├── types               # 应用内类型
│   ├── utils               # 应用内工具
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

业务模块内部建议结构：

```text
modules/product
├── api.ts
├── routes.ts
├── types.ts
├── constants.ts
├── components
├── composables
└── pages
    ├── ProductList.vue
    ├── ProductDetail.vue
    └── ProductEdit.vue
```

## 9. packages 设计

### 9.1 packages/types

存放前后端共享类型。

示例：

```text
packages/types
├── src
│   ├── auth.ts
│   ├── tenant.ts
│   ├── user.ts
│   ├── role.ts
│   ├── product.ts
│   ├── order.ts
│   └── index.ts
└── package.json
```

### 9.2 packages/constants

存放业务枚举、状态码、字典常量。

示例：

```ts
export enum TenantStatus {
  Pending = 'pending',
  Active = 'active',
  Disabled = 'disabled',
  Expired = 'expired'
}
```

### 9.3 packages/shared

存放纯工具函数。

示例：

- 时间格式化
- 金额格式化
- 树结构转换
- URL 参数处理
- 空值处理
- 防抖节流

### 9.4 packages/api-client

统一封装 API 请求。

职责：

- HTTP 实例
- 请求拦截器
- 响应拦截器
- API 模块
- 类型化请求
- 错误处理

### 9.5 packages/auth

封装认证与权限辅助能力。

职责：

- Token 存储
- Token 刷新
- 权限判断
- 菜单生成
- 按钮权限判断
- 租户上下文处理

### 9.6 packages/config

共享工程配置。

可包含：

- ESLint 配置
- Prettier 配置
- TypeScript 配置
- Vite 基础配置
- Tailwind preset，可选

### 9.7 packages/ui

可选。

初期不建议过早抽象大型 UI 包。

建议只放真正跨应用复用的业务组件，例如：

- TenantSwitcher
- PermissionButton
- MoneyText
- StatusTag
- PageHeader
- SearchForm

不要把所有页面组件都塞进 `packages/ui`。

## 10. 后端技术架构

### 10.1 确定技术栈

后端确定使用：

```text
NestJS + TypeScript + MySQL + Prisma
```

可选增强：

- Redis：缓存、验证码、限流、会话辅助
- BullMQ：异步任务、导出任务、消息队列
- MinIO / OSS / COS / R2：文件存储
- Swagger / OpenAPI：接口文档

### 10.2 api-server 目录结构

```text
apps/api-server
├── src
│   ├── common
│   │   ├── decorators
│   │   ├── filters
│   │   ├── guards
│   │   ├── interceptors
│   │   ├── pipes
│   │   └── utils
│   ├── config
│   ├── database
│   ├── modules
│   │   ├── auth
│   │   ├── tenant
│   │   ├── user
│   │   ├── role
│   │   ├── permission
│   │   ├── product
│   │   ├── order
│   │   ├── payment
│   │   ├── after-sale
│   │   ├── report
│   │   └── system
│   ├── app.module.ts
│   └── main.ts
├── prisma
│   ├── schema.prisma
│   └── migrations
├── package.json
└── tsconfig.json
```

### 10.3 后端核心能力

后端第一阶段必须具备：

- 统一异常处理
- 统一响应格式
- 参数校验
- JWT 鉴权
- Refresh Token
- RBAC 权限校验
- tenant_id 数据隔离
- 操作日志
- 登录日志
- 环境变量配置
- Swagger API 文档

## 11. 多租户技术策略

### 11.1 数据隔离方式

第一阶段建议使用：

```text
共享数据库 + 共享表 + tenant_id 字段隔离
```

原因：

- 实现成本较低。
- 适合中小型 SaaS 初期。
- 查询、统计、运维相对简单。
- 后续可按租户规模演进。

所有租户业务表必须包含：

```text
tenant_id
```

例如：

- users
- roles
- products
- orders
- customers
- files
- logs

### 11.2 后端隔离要求

后端必须强制做租户隔离，不能只依赖前端传参。

要求：

- 登录后从 Token 中识别用户类型和 tenantId。
- 租户用户查询数据时自动附加 tenant_id 条件。
- 平台用户可根据权限跨租户查询。
- 所有修改、删除操作必须校验数据归属。
- 操作日志必须记录 tenantId。

### 11.3 前端租户上下文

前端需要维护当前租户上下文。

平台用户可能有租户切换能力：

- 当前查看全部平台数据
- 当前查看某个租户数据

租户用户只能固定在自己的租户上下文中。

## 12. 权限技术策略

### 12.1 权限模型

推荐模型：

```text
User
└── UserRole
    └── Role
        └── RolePermission
            └── Permission
```

权限类型：

- menu：菜单权限
- page：页面权限
- button：按钮权限
- api：接口权限
- data：数据权限

### 12.2 前端权限

前端负责：

- 根据菜单权限生成菜单。
- 根据页面权限控制路由访问。
- 根据按钮权限控制按钮显示。
- 根据数据权限调整查询条件展示。

注意：前端权限只用于用户体验，不作为安全边界。

### 12.3 后端权限

后端负责真正的安全控制。

后端需要校验：

- 用户是否登录。
- Token 是否有效。
- 用户所属租户是否有效。
- 用户角色是否拥有接口权限。
- 用户是否能访问当前数据。

## 13. API 规范

### 13.1 URL 规范

建议使用 RESTful 风格。

示例：

```text
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id
```

### 13.2 响应格式

统一响应：

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "requestId": "req_xxx"
}
```

错误响应：

```json
{
  "code": 40001,
  "message": "无访问权限",
  "data": null,
  "requestId": "req_xxx"
}
```

分页响应：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100
    }
  },
  "requestId": "req_xxx"
}
```

### 13.3 错误码建议

```text
0       成功
40000   请求参数错误
40001   未登录或 Token 无效
40003   无访问权限
40004   资源不存在
40009   数据冲突
40100   租户不存在或已禁用
50000   系统内部错误
```

## 14. 主题与视觉规范

### 14.1 设计方向

后台整体视觉建议：

- 干净
- 现代
- 留白充足
- 支持暗色模式
- 支持品牌色切换
- 更接近 SaaS 控制台，而不是传统 ERP 后台

### 14.2 Tailwind 使用边界

Tailwind CSS 主要用于：

- 页面布局
- 间距
- 卡片
- 响应式
- 自定义视觉效果
- Dashboard 数据卡片
- 登录页和欢迎页

UI 组件库主要用于：

- 表格
- 表单
- 弹窗
- 抽屉
- 日期选择
- 上传
- 树
- 分页
- 下拉选择

不要用 Tailwind 重写所有基础组件，也不要用 UI 库限制所有自定义布局。

### 14.3 主题能力

需要支持：

- 明亮模式
- 暗色模式
- 品牌色配置
- 租户 Logo
- 租户系统名称
- 平台系统名称

## 15. 工程规范

### 15.1 语言规范

- 新代码统一使用 TypeScript。
- Vue 组件统一使用 `<script setup lang="ts">`。
- 共享包必须导出明确类型。
- 禁止大量使用 `any`。

### 15.2 命名规范

文件命名建议：

- Vue 页面组件：`ProductList.vue`
- Vue 普通组件：`ProductForm.vue`
- composable：`useProductList.ts`
- store：`auth.store.ts`
- API 模块：`product.api.ts`
- 类型文件：`product.types.ts`
- 常量文件：`product.constants.ts`

### 15.3 Git 分支建议

```text
main        # 稳定分支
release/*   # 发布分支
feature/*   # 功能分支
fix/*       # 修复分支
refactor/*  # 重构分支
```

### 15.4 代码质量

建议配置：

- ESLint
- Prettier
- Stylelint，可选
- TypeScript strict mode
- lint-staged
- husky，可选
- commitlint，可选

## 16. 构建与部署

### 16.1 本地开发命令建议

```bash
pnpm install
pnpm dev
pnpm dev:admin
pnpm dev:server
```

### 16.2 构建命令建议

```bash
pnpm build
pnpm build:admin
pnpm build:server
```

### 16.3 部署建议

第一阶段可以采用：

- admin-web 构建为静态资源，部署到 Nginx / CDN。
- api-server 部署为 Node.js 服务。
- MySQL 独立部署。
- Redis 可选。

后续可演进到：

- Docker Compose
- Kubernetes
- CI/CD 自动部署
- 多环境配置

## 17. 文档规划

建议维护以下文档：

```text
docs
├── requirements-upgrade.md     # 需求文档
├── technical-architecture.md   # 技术架构文档
├── database-design.md          # 数据库设计文档
├── api-design.md               # API 设计文档
├── permission-design.md        # 权限设计文档
├── tenant-design.md            # 多租户设计文档
└── development-guide.md        # 开发规范文档
```

## 18. 后续决策事项

仍需确认：

1. ORM 是否确定使用 Prisma。
2. 是否第一阶段接入 Redis。
3. 消费端 H5 是否使用 Vant。
4. 小程序端是否使用 uni-app / Taro。
5. 是否需要从第一阶段就支持暗色模式和主题切换。
6. 是否需要保留旧项目作为参考目录，还是新建独立重构目录。

## 19. 当前推荐技术选型汇总

| 分类 | 推荐选型 | 说明 |
| --- | --- | --- |
| 仓库架构 | pnpm workspace monorepo | 适合全栈多端长期演进 |
| 构建编排 | Turborepo | 初期可选，应用增多后推荐 |
| PC 前端 | Vite + Vue3 + TypeScript | 已确定方向 |
| 样式 | Tailwind CSS | 已确定方向 |
| PC UI 库 | Naive UI | 已确定，现代美观，适合 SaaS 后台 |
| 移动 H5 UI | Vant | 移动端成熟稳定 |
| 状态管理 | Pinia | Vue3 官方推荐生态 |
| 路由 | Vue Router | Vue 标准路由方案 |
| 国际化 | vue-i18n | 已接入，第一阶段支持中文和英文 |
| 请求 | Axios | 成熟稳定，便于封装 |
| 图表 | ECharts | 适合后台数据看板 |
| 后端框架 | NestJS | 已确定，适合模块化全栈系统 |
| 数据库 | MySQL | 适合当前业务 |
| ORM | Prisma | 类型友好，适合 TS 全栈 |
| 缓存 | Redis | 可选，建议预留 |
| API 文档 | Swagger / OpenAPI | 后端接口文档自动化 |

## 20. 总结

本项目重构建议采用：

```text
pnpm workspace monorepo
+ Vite
+ Vue 3
+ TypeScript
+ Tailwind CSS
+ Naive UI
+ NestJS
+ MySQL
+ Prisma
```

第一阶段保持架构克制，只先建设 `admin-web` 和 `api-server`，同时沉淀共享类型、认证、请求、常量和工具包。

后续根据业务稳定程度，逐步增加 `shop-h5`、`mobile-admin`、`shop-miniapp` 等应用。
