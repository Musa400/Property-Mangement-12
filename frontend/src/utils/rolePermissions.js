export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager', 
  TENANT: 'Tenant'
};

// Detailed permissions mapping with granular access control
export const PERMISSIONS = {
  // User Management: Only Admin can fully manage users
  USER_MANAGEMENT: {
    [ROLES.ADMIN]: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      assignRoles: true
    },
    [ROLES.MANAGER]: {
      view: false,
      create: false,
      edit: false,
      delete: false,
      assignRoles: false
    },
    [ROLES.TENANT]: {
      view: true,  
      create: false,
      edit: false,
      delete: false,
      assignRoles: false
    }
  },
  
  // Property View: Admins and Managers have full view, Tenants have limited view
  PROPERTY_VIEW: {
    [ROLES.ADMIN]: {
      view: true,
      details: true,
      edit: true,
      create: true,
      delete: true
    },
    [ROLES.MANAGER]: {
      view: true,
      details: true,
      edit: true,
      create: false,
      delete: false
    },
    [ROLES.TENANT]: {
      view: true,
      details: 'LIMITED',
      edit: false,
      create: false,
      delete: false
    }
  },
  
  // Financial Reports: Admins and Managers can access, Tenants cannot
  FINANCIAL_REPORTS: {
    [ROLES.ADMIN]: {
      view: true,
      generate: true,
      export: true
    },
    [ROLES.MANAGER]: {
      view: true,
      generate: true,
      export: false
    },
    [ROLES.TENANT]: {
      view: false,
      generate: false,
      export: false
    }
  },
  
  // Rent Payments: Tenants can pay, Managers can view, Admins have full control
  RENT_PAYMENT: {
    [ROLES.ADMIN]: {
      view: true,
      process: true,
      refund: true
    },
    [ROLES.MANAGER]: {
      view: true,
      process: false,
      refund: false
    },
    [ROLES.TENANT]: {
      view: true,
      process: true,
      refund: false
    }
  },
  
  // Maintenance Requests: Different levels of interaction based on role
  MAINTENANCE_REQUEST: {
    [ROLES.ADMIN]: {
      view: true,
      create: true,
      assign: true,
      approve: true,
      resolve: true
    },
    [ROLES.MANAGER]: {
      view: true,
      create: true,
      assign: true,
      approve: true,
      resolve: false
    },
    [ROLES.TENANT]: {
      view: true,
      create: true,
      assign: false,
      approve: false,
      resolve: false
    }
  }
};

// Enhanced permission checking with granular control
export const checkPermission = (role, permission, action = 'view') => {
  return PERMISSIONS[permission]?.[role]?.[action] || false;
};

// Dynamic route filtering based on role permissions
export const filterAllowedRoutes = (role) => {
  const routes = [
    { 
      path: '/dashboard', 
      allowedRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.TENANT],
      requiredPermissions: {
        [ROLES.ADMIN]: { view: true },
        [ROLES.MANAGER]: { view: true },
        [ROLES.TENANT]: { view: true }
      }
    },
    { 
      path: '/user-management', 
      allowedRoles: [ROLES.ADMIN],
      requiredPermissions: {
        [ROLES.ADMIN]: { view: true }
      }
    },
    { 
      path: '/properties', 
      allowedRoles: [ROLES.ADMIN, ROLES.MANAGER],
      requiredPermissions: {
        [ROLES.ADMIN]: { view: true },
        [ROLES.MANAGER]: { view: true }
      }
    },
    { 
      path: '/financial-reports', 
      allowedRoles: [ROLES.ADMIN, ROLES.MANAGER],
      requiredPermissions: {
        [ROLES.ADMIN]: { view: true },
        [ROLES.MANAGER]: { view: true }
      }
    },
    { 
      path: '/rent-payments', 
      allowedRoles: [ROLES.TENANT, ROLES.MANAGER, ROLES.ADMIN],
      requiredPermissions: {
        [ROLES.ADMIN]: { view: true },
        [ROLES.MANAGER]: { view: true },
        [ROLES.TENANT]: { view: true }
      }
    },
    { 
      path: '/maintenance-requests', 
      allowedRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.TENANT],
      requiredPermissions: {
        [ROLES.ADMIN]: { view: true },
        [ROLES.MANAGER]: { view: true },
        [ROLES.TENANT]: { view: true }
      }
    }
  ];
  
  return routes.filter(route => 
    route.allowedRoles.includes(role) && 
    route.requiredPermissions[role]?.view
  );
};