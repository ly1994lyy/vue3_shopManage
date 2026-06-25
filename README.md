# Shop SaaS

面向全栈、多端、多角色、多租户场景重构的商城 SaaS 项目。

当前仓库已经从旧版 Vue3 商城后台重构为 monorepo 起步结构，旧代码不再作为实现基础。后续开发以 `docs/requirements-upgrade.md` 和 `docs/technical-architecture.md` 为准。

## 技术栈

### Monorepo

- pnpm workspace
- Turborepo
- TypeScript

### PC 管理后台

- Vite
- Vue 3
- TypeScript
- Tailwind CSS
- Naive UI
- Pinia
- Vue Router

### 后端服务

- NestJS
- TypeScript
- Swagger / OpenAPI
- MySQL，规划
- Prisma，规划

## 目录结构

```text
apps
├── admin-web       # PC 管理后台
└── api-server      # NestJS API 服务

packages
├── api-client      # 请求 SDK
├── auth            # 认证与权限辅助
├── config          # 工程共享配置
├── constants       # 常量与枚举
├── shared          # 通用工具函数
└── types           # 共享类型

docs                 # 需求、架构与设计文档
```

## 开发命令

安装依赖：

```bash
pnpm install
```

启动全部开发服务：

```bash
pnpm dev
```

只启动 PC 管理后台：

```bash
pnpm dev:admin
```

只启动 API 服务：

```bash
pnpm dev:server
```

构建：

```bash
pnpm build
```

类型检查：

```bash
pnpm typecheck
```

## 真实登录账号

当前已通过 Prisma seed 创建默认平台管理员账号：

```text
账号：admin
密码：123456
```

初始化数据库并创建账号：

```bash
pnpm --filter @shop-saas/api-server db:init
```

如果数据库结构已同步，只需要重新写入默认数据：

```bash
pnpm --filter @shop-saas/api-server prisma:seed
```

本地开发时需要同时启动后端和前端：

```bash
pnpm dev:server
pnpm dev:admin
```

## 文档

- [使用手册](docs/usage-guide.md)
- [升级需求文档](docs/requirements-upgrade.md)
- [技术架构设计文档](docs/technical-architecture.md)
- [多租户设计](docs/tenant-design.md)
- [权限设计](docs/permission-design.md)
- [API 设计](docs/api-design.md)
- [数据库设计](docs/database-design.md)

## 当前阶段

第一阶段目标：

- 建立 monorepo 基础工程
- 搭建现代化 PC 管理后台基础界面
- 搭建 NestJS API 服务骨架
- 建立共享 types/constants/shared/api-client/auth/config 包
- 后续补充数据库设计、权限设计、多租户设计和 API 设计
