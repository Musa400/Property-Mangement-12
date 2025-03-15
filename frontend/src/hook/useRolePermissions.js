import { useState, useEffect } from 'react';
import { ROLES, PERMISSIONS, checkPermission, filterAllowedRoutes } from '../utils/rolePermissions';

export const useRolePermissions = (userRole) => {
  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    // Filter routes based on user role
    const routes = filterAllowedRoutes(userRole);
    setAllowedRoutes(routes);

    // Compile permissions for the current role
    const rolePermissions = Object.keys(PERMISSIONS).reduce((acc, permissionKey) => {
      acc[permissionKey] = Object.keys(PERMISSIONS[permissionKey][userRole] || {}).reduce((actionAcc, action) => {
        actionAcc[action] = checkPermission(userRole, permissionKey, action);
        return actionAcc;
      }, {});
      return acc;
    }, {});

    setPermissions(rolePermissions);
  }, [userRole]);

  // Check if a specific route is allowed
  const isRouteAllowed = (path) => {
    return allowedRoutes.some(route => route.path === path);
  };

  // Check permission for a specific action
  const hasPermission = (permission, action = 'view') => {
    return permissions[permission]?.[action] || false;
  };

  return {
    roles: ROLES,
    allowedRoutes,
    hasPermission,
    isRouteAllowed
  };
};