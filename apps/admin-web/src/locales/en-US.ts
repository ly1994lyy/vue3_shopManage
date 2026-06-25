export default {
  common: {
    appName: 'Shop SaaS',
    subtitle: 'Full-stack multi-tenant commerce SaaS',
    language: 'Language',
    theme: 'Theme',
    logout: 'Logout',
    create: 'Create',
    search: 'Search',
    status: 'Status',
    actions: 'Actions',
    allTenants: 'All tenants',
    loading: 'Loading...',
    loadFailed: 'Failed to load data',
    back: 'Back',
    delete: 'Delete',
    reset: 'Reset'
  },
  auth: {
    badge: 'Modern Multi-tenant Commerce Platform',
    title: 'Rebuild the commerce SaaS console with a modern architecture',
    description: 'Powered by Vue 3, TypeScript, Tailwind CSS, Naive UI and NestJS for multi-end, multi-role and multi-tenant scenarios.',
    welcome: 'Welcome back',
    loginTip: 'Sign in to Shop SaaS Console',
    account: 'Account',
    password: 'Password',
    accountPlaceholder: 'Enter account',
    passwordPlaceholder: 'Enter password',
    submit: 'Enter Console',
    demoTip: 'Current demo login: admin / 123456.',
    stats: {
      tenant: 'Tenant isolation',
      rbac: 'RBAC permissions',
      saas: 'SaaS evolution'
    }
  },
  nav: {
    dashboard: 'Dashboard',
    tenants: 'Tenant Hub',
    products: 'Products',
    productList: 'Product List',
    productCategories: 'Categories',
    orders: 'Orders',
    orderList: 'Order List',
    members: 'Members & Access',
    access: 'Roles & Permissions',
    audit: 'Audit Logs',
    auditOperations: 'Operation Logs',
    auditLogins: 'Login Logs',
    settings: 'Settings'
  },
  dashboard: {
    title: 'Dashboard',
    overview: 'Overview',
    heroTitle: 'The modern commerce SaaS console foundation is ready',
    heroDescription: 'Phase one focuses on monorepo, unified auth, tenant isolation, RBAC and a polished PC admin experience.',
    createTenant: 'Create Tenant',
    viewArchitecture: 'View Architecture',
    metrics: {
      tenants: 'Platform tenants',
      gmv: 'Today GMV',
      pendingOrders: 'Pending orders',
      risks: 'Risk alerts'
    },
    tasks: 'Milestones',
    tasksTip: 'Driven by the requirements and technical architecture documents',
    keywords: 'Architecture keywords',
    expiringTenants: 'Expiring tenants',
    expiringTenantsTip: 'Expiring within 30 days or already expired',
    viewAll: 'View all',
    noExpiring: 'No expiring tenants'
  },
  tenant: {
    title: 'Tenant Hub',
    list: 'Tenant List',
    listTip: 'Demo data, to be connected with NestJS APIs later',
    searchPlaceholder: 'Search tenant / contact',
    create: 'Create Tenant',
    columns: {
      name: 'Tenant name',
      code: 'Tenant code',
      contact: 'Contact',
      phone: 'Phone',
      email: 'Email',
      plan: 'Plan',
      status: 'Status',
      expiredAt: 'Expires at',
      daysRemaining: 'Remaining'
    },
    status: {
      pending: 'Pending',
      active: 'Active',
      disabled: 'Disabled',
      expired: 'Expired'
    },
    plan: {
      starter: 'Starter',
      standard: 'Standard',
      pro: 'Pro',
      enterprise: 'Enterprise'
    },
    neverExpire: 'Never',
    daysRemaining: '{days} days left',
    daysExpired: 'Expired {days}d',
    actions: {
      edit: 'Edit Tenant',
      enable: 'Enable',
      disable: 'Disable',
      renew: 'Renew',
      initAdmin: 'Init Admin'
    },
    renewFor: 'Renew for',
    renewHint: 'Adding months to tenant "{tenant}" validity period',
    admin: {
      defaultName: 'Tenant Admin'
    },
    messages: {
      created: 'Tenant created successfully',
      updated: 'Tenant updated successfully',
      adminInitialized: 'Tenant admin initialized successfully',
      renewed: 'Tenant renewed successfully'
    }
  },
  user: {
    title: 'User Management',
    list: 'User List',
    listTip: 'Live data from NestJS User API',
    searchPlaceholder: 'Search account / name / email',
    columns: {
      keyword: 'Keyword',
      account: 'Account',
      name: 'Name',
      email: 'Email',
      type: 'Type',
      status: 'Status',
      roles: 'Roles'
    },
    type: {
      platform: 'Platform user',
      tenant: 'Tenant user',
      customer: 'Customer'
    },
    status: {
      active: 'Active',
      disabled: 'Disabled'
    },
    actions: {
      create: 'Create User',
      edit: 'Edit User',
      assignRoles: 'Assign Roles',
      resetPassword: 'Reset Password'
    },
    form: {
      password: 'Password',
      roles: 'User roles'
    },
    messages: {
      saved: 'User saved successfully',
      assigned: 'Roles assigned successfully',
      passwordReset: 'Password reset successfully'
    }
  },
  access: {
    title: 'Roles & Permissions',
    roles: 'Roles',
    permissions: 'Permissions',
    rolesTip: 'Live data from NestJS Role API',
    permissionsTip: 'Permission points initialized by seed',
    scope: {
      platform: 'Platform',
      tenant: 'Tenant'
    },
    columns: {
      name: 'Name',
      code: 'Code',
      scope: 'Scope',
      permissions: 'Permissions',
      type: 'Type'
    },
    actions: {
      createRole: 'Create Role',
      edit: 'Edit',
      assign: 'Assign',
      save: 'Save',
      cancel: 'Cancel'
    },
    form: {
      roleName: 'Role name',
      roleCode: 'Role code',
      roleScope: 'Role scope',
      description: 'Description',
      permissions: 'Permissions'
    },
    messages: {
      saved: 'Saved successfully',
      assigned: 'Assigned successfully'
    }
  },
  product: {
    title: 'Product Center',
    listTitle: 'Product List',
    categoryTitle: 'Product Categories',
    list: 'Product List',
    listTip: 'Live data from NestJS Product API',
    searchPlaceholder: 'Search by name / code',
    categories: 'Product Categories',
    categoriesTip: 'Manage multi-level categories under the tenant',
    emptyCategories: 'No category yet. Create one first.',
    allCategories: 'All categories',
    rootCategory: 'Root category',
    columns: {
      cover: 'Cover',
      name: 'Product name',
      code: 'Code',
      category: 'Category',
      price: 'Price',
      stock: 'Stock',
      status: 'Status',
      parent: 'Parent category',
      sort: 'Sort',
      children: 'Children'
    },
    status: {
      draft: 'Draft',
      on_sale: 'On sale',
      off_sale: 'Off sale',
      archived: 'Archived'
    },
    actions: {
      create: 'Create Product',
      edit: 'Edit',
      delete: 'Delete',
      createCategory: 'Create Category',
      editCategory: 'Edit Category'
    },
    form: {
      brief: 'Brief',
      parent: 'Parent category',
      sort: 'Sort'
    },
    messages: {
      saved: 'Product saved successfully',
      deleted: 'Product deleted',
      categorySaved: 'Category saved successfully',
      categoryDeleted: 'Category deleted'
    }
  },
  order: {
    title: 'Order Management',
    list: 'Order List',
    listTip: 'Live data from NestJS Order API',
    detail: 'Order Detail',
    searchPlaceholder: 'Search by order number',
    columns: {
      orderNo: 'Order No.',
      totalAmount: 'Total Amount',
      status: 'Status',
      receiver: 'Receiver',
      phone: 'Phone',
      address: 'Address',
      createdAt: 'Created At',
      product: 'Product',
      price: 'Price',
      quantity: 'Quantity',
      subtotal: 'Subtotal',
      shippingFee: 'Shipping Fee',
      discount: 'Discount',
      remark: 'Remark'
    },
    status: {
      pending: 'Pending',
      paid: 'Paid',
      shipped: 'Shipped',
      completed: 'Completed',
      cancelled: 'Cancelled',
      refunded: 'Refunded'
    },
    sections: {
      basic: 'Basic Information',
      items: 'Order Items',
      amount: 'Amount Details'
    },
    actions: {
      view: 'View',
      ship: 'Ship',
      cancel: 'Cancel',
      create: 'Create Order'
    },
    create: {
      title: 'Create Order',
      description: 'Select products and fill in receiver information to create a new order',
      sections: {
        products: 'Product Selection',
        receiver: 'Receiver Information',
        amount: 'Amount Summary'
      },
      actions: {
        addProduct: 'Add Product',
        select: 'Select',
        submit: 'Submit Order'
      },
      placeholders: {
        receiverName: 'Enter receiver name',
        receiverPhone: 'Enter receiver phone',
        receiverAddress: 'Enter receiver address',
        remark: 'Order remark (optional)'
      },
      rules: {
        receiverName: 'Please enter receiver name',
        receiverPhone: 'Please enter a valid phone number',
        receiverAddress: 'Please enter receiver address'
      },
      messages: {
        productAdded: 'Product added',
        noProduct: 'Please add products first',
        created: 'Order created successfully',
        noProductsAvailable: 'No products available. Please create products first.'
      }
    },
    prompt: {
      trackingNo: 'Please enter tracking number'
    },
    messages: {
      shipped: 'Shipped successfully',
      cancelled: 'Order cancelled',
      confirmCancel: 'Are you sure you want to cancel this order?'
    }
  },
  errors: {
    badRequest: 'Invalid request parameters. Please check your input.',
    unauthorized: 'Your session has expired. Please sign in again.',
    forbidden: 'You do not have permission to access this resource.',
    notFound: 'Resource not found.',
    conflict: 'The data already exists or conflicts with another record.',
    tenantUnavailable: 'Tenant does not exist or has been disabled.',
    serverError: 'Internal server error. Please try again later.',
    unknown: 'Operation failed. Please try again later.'
  },
  audit: {
    operation: {
      title: 'Operation Logs',
      listTitle: 'Operations',
      listTip: 'Newest first'
    },
    login: {
      title: 'Login Logs',
      listTitle: 'Logins',
      listTip: 'Newest first'
    },
    searchPlaceholder: 'Account / path / message',
    metrics: {
      total: 'Total',
      last24h: 'Last 24h',
      failures: 'Failures'
    },
    columns: {
      time: 'Time',
      account: 'Account',
      module: 'Module',
      action: 'Action',
      description: 'Description',
      path: 'Request',
      ip: 'IP',
      userAgent: 'User-Agent',
      duration: 'Duration',
      result: 'Result'
    },
    modules: {
      tenant: 'Tenant',
      user: 'User',
      role: 'Role',
      product: 'Product',
      order: 'Order'
    },
    result: {
      success: 'Success',
      failure: 'Failure'
    },
    detail: 'Detail',
    payload: 'Request payload',
    payloadEmpty: 'No request body recorded',
    cleanup: {
      action: 'Clean up now',
      success: 'Cleanup complete: {ops} operations, {logins} logins removed'
    }
  }
}
