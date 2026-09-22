import { Prisma } from '@prisma/client';

/** Ensures tenant_id is always present before Prisma create/update. */
export function withTenantId<T extends Record<string, unknown>>(
  tenantId: string,
  data: T,
): T & { tenantId: string } {
  if (!tenantId) {
    throw new Error('TENANT_ID_REQUIRED');
  }
  return { ...data, tenantId };
}

export function asJson(
  value: Record<string, unknown> | undefined,
): Prisma.InputJsonValue {
  return (value ?? {}) as Prisma.InputJsonValue;
}
