export type DbStrategy = 'shared_rls' | 'shared_rls_cache' | 'dedicated';

export type TenantPlanCode = 'internal' | 'free' | 'growth' | 'enterprise';

export interface TenantContext {
  tenantId: string;
  userId: string;
  roles: string[];
  permissions: string[];
}

export const PERMISSIONS = {
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  ROLE_MANAGE: 'role:manage',
  ACCOUNT_READ: 'account:read',
  ACCOUNT_WRITE: 'account:write',
  CONTACT_READ: 'contact:read',
  CONTACT_WRITE: 'contact:write',
  LEAD_READ: 'lead:read',
  LEAD_WRITE: 'lead:write',
  DEAL_READ: 'deal:read',
  DEAL_WRITE: 'deal:write',
  ACTIVITY_READ: 'activity:read',
  ACTIVITY_WRITE: 'activity:write',
  DASHBOARD_READ: 'dashboard:read',
} as const;

export type PermissionCode =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const SYSTEM_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES: 'sales',
  VIEWER: 'viewer',
} as const;

export function assertTenantId(tenantId: string | null | undefined): asserts tenantId is string {
  if (!tenantId || typeof tenantId !== 'string' || !tenantId.trim()) {
    throw new Error('TENANT_ID_REQUIRED: every operation must include tenant_id');
  }
}

export function redisTenantKey(tenantId: string, ...parts: string[]): string {
  assertTenantId(tenantId);
  return ['tenant', tenantId, ...parts].join(':');
}
