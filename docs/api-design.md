# API 设计文档

> 版本：v0.1  
> 范围：商城 SaaS 第一阶段 API 规范

## 1. 设计目标

API 设计需要满足：

- 前后端分离
- 多端统一接入
- 多租户上下文
- 多角色权限控制
- 统一响应格式
- 统一错误码
- Swagger / OpenAPI 文档生成

## 2. 基础路径

后端 API 统一前缀：

```text
/api
```

本地开发：

```text
http://localhost:3000/api
```

Swagger：

```text
http://localhost:3000/api/docs
```

## 3. 响应格式

成功响应：

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
  "code": 40003,
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

## 4. 错误码

| code | 说明 |
| --- | --- |
| 0 | 成功 |
| 40000 | 请求参数错误 |
| 40001 | 未登录或 Token 无效 |
| 40003 | 无访问权限 |
| 40004 | 资源不存在 |
| 40009 | 数据冲突 |
| 40100 | 租户不存在或已禁用 |
| 50000 | 系统内部错误 |

## 5. 认证 Header

认证使用 Bearer Token：

```text
Authorization: Bearer <access_token>
```

平台用户切换租户上下文时，可使用：

```text
X-Tenant-Id: <tenant_id>
```

注意：

- `X-Tenant-Id` 只作为平台用户查看租户上下文的辅助信息。
- 租户用户的 tenantId 必须以后端认证信息为准。
- 后端不能直接信任客户端传入的 tenantId。

## 6. 第一阶段 API 模块

当前已实现第一批接口骨架：

- Health
- Auth
- Tenant
- User

接口已经接入统一响应拦截器和异常过滤器，控制器只返回业务数据，由全局拦截器统一包裹为 `{ code, message, data, requestId }`。

### 6.1 Health

```text
GET /api/health
```

用于服务健康检查。

### 6.2 Auth

```text
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/profile
```

默认真实登录账号由 Prisma seed 创建：

```text
账号：admin
密码：123456
角色：平台超级管理员
```

初始化命令：

```bash
pnpm --filter @shop-saas/api-server db:init
```

### 6.3 Tenant

```text
GET    /api/tenants
POST   /api/tenants
GET    /api/tenants/:id
PATCH  /api/tenants/:id
DELETE /api/tenants/:id
```

说明：

- `GET /api/tenants` 支持 `page`、`pageSize`、`keyword`、`status`。
- 当前已实现基础 CRUD 骨架。
- 删除当前为物理删除，后续可按业务要求改为软删除。

### 6.4 User

```text
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
```

说明：

- `GET /api/users` 支持 `page`、`pageSize`、`keyword`、`status`。
- 当前已实现用户创建、查询、更新骨架。
- 密码哈希已接入 argon2。
- 受保护接口默认通过全局 Auth Guard 校验 Bearer Token，并通过 Permission Guard 读取 `@RequirePermissions()` 元数据。

### 6.5 Role / Permission

```text
GET   /api/roles
POST  /api/roles
GET   /api/roles/:id
PATCH /api/roles/:id
DELETE /api/roles/:id

GET  /api/permissions
POST /api/roles/:id/permissions
```

## 7. 查询参数规范

列表接口通用参数：

```text
page=1
pageSize=20
keyword=xxx
status=active
createdAtStart=2026-01-01
createdAtEnd=2026-12-31
```

排序参数：

```text
sortBy=createdAt
sortOrder=desc
```

## 8. REST 动作规范

| 动作 | HTTP 方法 |
| --- | --- |
| 查询列表 | GET |
| 查询详情 | GET |
| 创建 | POST |
| 局部更新 | PATCH |
| 删除 | DELETE |
| 状态变更 | PATCH |

## 9. Swagger 要求

NestJS 接口需要补充：

- `@ApiTags`
- `@ApiOperation`
- DTO class
- 响应示例
- 认证声明

## 10. 前端 api-client 要求

`packages/api-client` 负责：

- 注入 Token。
- 后续注入租户上下文。
- 统一解析响应。
- 统一错误处理。
- 提供类型化接口。

## 11. 后续补充

后续需要补充：

- 商品中心 API
- 订单中心 API
- 库存中心 API
- 售后中心 API
- 文件上传 API
- 操作日志 API
