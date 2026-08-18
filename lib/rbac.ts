// Role-Based Access Control (RBAC) System
// Defines enterprise roles, granular permissions, and authorization gates.

export type Role = "SuperAdmin" | "Admin" | "CatalogManager" | "OrderManager" | "Viewer" | "Customer";

export type Permission =
  // Products
  | "products:view"
  | "products:create"
  | "products:update"
  | "products:delete"
  // Categories
  | "categories:view"
  | "categories:create"
  | "categories:update"
  | "categories:delete"
  // Coupons
  | "coupons:view"
  | "coupons:create"
  | "coupons:update"
  | "coupons:delete"
  // Orders
  | "orders:view"
  | "orders:update_status"
  | "orders:refund"
  // Settings & Staff
  | "staff:manage"
  | "settings:manage";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SuperAdmin: [
    "products:view", "products:create", "products:update", "products:delete",
    "categories:view", "categories:create", "categories:update", "categories:delete",
    "coupons:view", "coupons:create", "coupons:update", "coupons:delete",
    "orders:view", "orders:update_status", "orders:refund",
    "staff:manage", "settings:manage"
  ],
  Admin: [
    "products:view", "products:create", "products:update", "products:delete",
    "categories:view", "categories:create", "categories:update", "categories:delete",
    "coupons:view", "coupons:create", "coupons:update", "coupons:delete",
    "orders:view", "orders:update_status"
  ],
  CatalogManager: [
    "products:view", "products:create", "products:update", "products:delete",
    "categories:view", "categories:create", "categories:update",
    "coupons:view", "orders:view"
  ],
  OrderManager: [
    "orders:view", "orders:update_status",
    "products:view", "categories:view", "coupons:view"
  ],
  Viewer: [
    "products:view", "categories:view", "coupons:view", "orders:view"
  ],
  Customer: []
};

/**
 * Checks whether a given role has a specific permission.
 */
export function hasPermission(role: Role | string | undefined, permission: Permission): boolean {
  if (!role) return false;
  const canonicalRole = (role.charAt(0).toUpperCase() + role.slice(1)) as Role;
  const permissions = ROLE_PERMISSIONS[canonicalRole] || [];
  return permissions.includes(permission);
}

/**
 * Checks whether a user object has a specific permission.
 */
export function can(user: { role?: string } | null | undefined, permission: Permission): boolean {
  if (!user?.role) return false;
  return hasPermission(user.role, permission);
}

/**
 * Retrieves the list of all permissions assigned to a role.
 */
export function getRolePermissions(role: Role | string): Permission[] {
  const canonicalRole = (role.charAt(0).toUpperCase() + role.slice(1)) as Role;
  return ROLE_PERMISSIONS[canonicalRole] || [];
}
