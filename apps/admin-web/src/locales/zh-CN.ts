export default {
  common: {
    appName: 'Shop SaaS',
    subtitle: '全栈多租户商城 SaaS',
    language: '语言',
    theme: '主题',
    logout: '退出登录',
    create: '新增',
    search: '搜索',
    status: '状态',
    actions: '操作',
    allTenants: '全部租户',
    loading: '加载中...',
    loadFailed: '数据加载失败',
    back: '返回',
    add: '添加',
    delete: '删除',
    reset: '重置'
  },
  auth: {
    badge: '现代化多租户商城平台',
    title: '用现代化架构重构商城 SaaS 管理平台',
    description: '基于 Vue 3、TypeScript、Tailwind CSS、Naive UI 与 NestJS，面向多端、多角色、多租户场景打造统一控制台。',
    welcome: '欢迎回来',
    loginTip: '登录 Shop SaaS 控制台',
    account: '账号',
    password: '密码',
    accountPlaceholder: '请输入账号',
    passwordPlaceholder: '请输入密码',
    submit: '进入控制台',
    demoTip: '当前为前端架构演示登录：账号 admin，密码 123456。',
    stats: {
      tenant: '多租户隔离',
      rbac: '角色权限体系',
      saas: '平台化演进'
    }
  },
  nav: {
    dashboard: '经营工作台',
    tenants: '租户中枢',
    products: '商品中心',
    productList: '商品列表',
    productCategories: '商品分类',
    orders: '订单履约',
    orderList: '订单列表',
    members: '成员权限',
    access: '角色权限',
    audit: '审计日志',
    auditOperations: '操作日志',
    auditLogins: '登录日志',
    settings: '系统设置'
  },
  dashboard: {
    title: '经营工作台',
    overview: '概览',
    heroTitle: '现代化商城 SaaS 控制台基础架构已启动',
    heroDescription: '第一阶段聚焦 monorepo、统一认证、租户隔离、RBAC 权限体系与 PC 管理后台体验。',
    createTenant: '创建租户',
    viewArchitecture: '查看架构文档',
    metrics: {
      tenants: '平台租户',
      gmv: '今日 GMV',
      pendingOrders: '待处理订单',
      risks: '风险提醒'
    },
    tasks: '阶段任务',
    tasksTip: '根据需求文档和技术架构文档推进',
    keywords: '架构关键词',
    expiringTenants: '即将到期租户',
    expiringTenantsTip: '未来 30 天内到期或已过期',
    viewAll: '全部',
    noExpiring: '暂无即将到期的租户'
  },
  tenant: {
    title: '租户中枢',
    list: '租户列表',
    listTip: '演示数据，后续对接 NestJS API',
    searchPlaceholder: '搜索租户 / 联系人',
    create: '新增租户',
    columns: {
      name: '租户名称',
      code: '租户编码',
      contact: '联系人',
      phone: '联系电话',
      email: '邮箱',
      plan: '套餐',
      status: '状态',
      expiredAt: '到期时间',
      daysRemaining: '剩余'
    },
    status: {
      pending: '待审核',
      active: '正常',
      disabled: '已禁用',
      expired: '已过期'
    },
    plan: {
      starter: '入门版',
      standard: '标准版',
      pro: '专业版',
      enterprise: '企业版'
    },
    neverExpire: '永久',
    daysRemaining: '剩余 {days} 天',
    daysExpired: '已过期 {days} 天',
    actions: {
      edit: '编辑租户',
      enable: '启用',
      disable: '禁用',
      renew: '续期',
      initAdmin: '初始化管理员'
    },
    renewFor: '续期时长',
    renewHint: '将在「{tenant}」当前有效期基础上累加',
    admin: {
      defaultName: '租户管理员'
    },
    messages: {
      created: '租户创建成功',
      updated: '租户更新成功',
      adminInitialized: '租户管理员初始化成功',
      renewed: '租户续期成功'
    }
  },
  user: {
    title: '用户管理',
    list: '用户列表',
    listTip: '来自 NestJS User API 的真实数据',
    searchPlaceholder: '搜索账号 / 姓名 / 邮箱',
    columns: {
      keyword: '关键词',
      account: '账号',
      name: '姓名',
      email: '邮箱',
      type: '类型',
      status: '状态',
      roles: '角色'
    },
    type: {
      platform: '平台用户',
      tenant: '租户用户',
      customer: '消费者'
    },
    status: {
      active: '正常',
      disabled: '禁用'
    },
    actions: {
      create: '新增用户',
      edit: '编辑用户',
      assignRoles: '分配角色',
      resetPassword: '重置密码'
    },
    form: {
      password: '密码',
      roles: '用户角色'
    },
    messages: {
      saved: '用户保存成功',
      assigned: '角色分配成功',
      passwordReset: '密码重置成功'
    }
  },
  access: {
    title: '角色权限',
    roles: '角色',
    permissions: '权限',
    rolesTip: '来自 NestJS Role API 的真实数据',
    permissionsTip: '来自 seed 初始化的权限点',
    scope: {
      platform: '平台级',
      tenant: '租户级'
    },
    columns: {
      name: '名称',
      code: '编码',
      scope: '作用域',
      permissions: '权限数',
      type: '类型'
    },
    actions: {
      createRole: '新增角色',
      edit: '编辑',
      assign: '授权',
      save: '保存',
      cancel: '取消'
    },
    form: {
      roleName: '角色名称',
      roleCode: '角色编码',
      roleScope: '角色作用域',
      description: '描述',
      permissions: '权限'
    },
    messages: {
      saved: '保存成功',
      assigned: '授权成功'
    }
  },
  product: {
    title: '商品中心',
    listTitle: '商品列表',
    categoryTitle: '商品分类',
    list: '商品列表',
    listTip: '来自 NestJS Product API 的真实数据',
    searchPlaceholder: '搜索商品名称 / 编码',
    categories: '商品分类',
    categoriesTip: '管理租户下的多级商品分类',
    emptyCategories: '当前租户暂无分类，先新增一个',
    allCategories: '全部分类',
    rootCategory: '顶级分类',
    columns: {
      cover: '主图',
      name: '商品名称',
      code: '商品编码',
      category: '分类',
      price: '售价',
      costPrice: '成本价',
      stock: '库存',
      weight: '重量 (kg)',
      status: '状态',
      parent: '父级分类',
      sort: '排序',
      children: '子分类数'
    },
    status: {
      draft: '草稿',
      on_sale: '在售',
      off_sale: '下架',
      archived: '归档'
    },
    actions: {
      create: '新增商品',
      edit: '编辑',
      delete: '删除',
      createCategory: '新增分类',
      editCategory: '编辑分类'
    },
    form: {
      brief: '商品简介',
      description: '详细描述',
      costPrice: '成本价',
      weight: '重量',
      cover: '封面图片',
      images: '商品图片',
      parent: '父级分类',
      sort: '排序'
    },
    messages: {
      saved: '商品保存成功',
      deleted: '商品已删除',
      categorySaved: '分类保存成功',
      categoryDeleted: '分类已删除'
    }
  },
  order: {
    title: '订单管理',
    list: '订单列表',
    listTip: '来自 NestJS Order API 的真实数据',
    detail: '订单详情',
    searchPlaceholder: '搜索订单号',
    columns: {
      orderNo: '订单号',
      totalAmount: '总金额',
      status: '订单状态',
      receiver: '收货人',
      phone: '联系电话',
      address: '收货地址',
      createdAt: '创建时间',
      product: '商品',
      price: '单价',
      quantity: '数量',
      subtotal: '小计',
      shippingFee: '运费',
      discount: '优惠',
      remark: '备注'
    },
    status: {
      pending: '待支付',
      paid: '已支付',
      shipped: '已发货',
      completed: '已完成',
      cancelled: '已取消',
      refunded: '已退款'
    },
    sections: {
      basic: '基本信息',
      items: '商品明细',
      amount: '金额信息'
    },
    actions: {
      view: '查看',
      ship: '发货',
      cancel: '取消',
      create: '创建订单'
    },
    create: {
      title: '创建订单',
      description: '选择商品并填写收货信息创建新订单',
      sections: {
        products: '商品选择',
        receiver: '收货信息',
        amount: '金额汇总'
      },
      actions: {
        addProduct: '添加商品',
        select: '选择',
        submit: '提交订单'
      },
      placeholders: {
        receiverName: '请输入收货人姓名',
        receiverPhone: '请输入收货人电话',
        receiverAddress: '请输入收货地址',
        remark: '订单备注（可选）'
      },
      rules: {
        receiverName: '请输入收货人姓名',
        receiverPhone: '请输入正确的手机号码',
        receiverAddress: '请输入收货地址'
      },
      messages: {
        productAdded: '商品已添加',
        noProduct: '请先添加商品',
        created: '订单创建成功',
        noProductsAvailable: '当前没有在售商品，请先创建商品'
      }
    },
    prompt: {
      trackingNo: '请输入快递单号'
    },
    messages: {
      shipped: '发货成功',
      cancelled: '订单已取消',
      confirmCancel: '确定要取消该订单吗？'
    }
  },
  errors: {
    badRequest: '请求参数错误，请检查输入内容',
    unauthorized: '登录已失效，请重新登录',
    forbidden: '无访问权限',
    notFound: '资源不存在',
    conflict: '数据已存在或发生冲突',
    tenantUnavailable: '租户不存在或已禁用',
    serverError: '系统内部错误，请稍后再试',
    unknown: '操作失败，请稍后再试'
  },
  audit: {
    operation: {
      title: '操作日志',
      listTitle: '操作记录',
      listTip: '按时间倒序展示最新操作'
    },
    login: {
      title: '登录日志',
      listTitle: '登录记录',
      listTip: '按时间倒序'
    },
    searchPlaceholder: '账号 / 路径 / 描述',
    metrics: {
      total: '日志总数',
      last24h: '近 24 小时',
      failures: '失败次数'
    },
    columns: {
      time: '时间',
      account: '账号',
      module: '模块',
      action: '操作',
      description: '描述',
      path: '请求',
      ip: 'IP',
      userAgent: 'User-Agent',
      duration: '耗时',
      result: '结果'
    },
    modules: {
      tenant: '租户',
      user: '用户',
      role: '角色',
      product: '商品',
      order: '订单'
    },
    result: {
      success: '成功',
      failure: '失败'
    },
    detail: '详情',
    payload: '请求数据',
    payloadEmpty: '该接口未携带请求体',
    cleanup: {
      action: '立即清理',
      success: '清理完成：操作日志 {ops} 条，登录日志 {logins} 条'
    }
  }
}
