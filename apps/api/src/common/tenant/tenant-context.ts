import { AsyncLocalStorage } from 'node:async_hooks';
import { assertTenantId, type TenantContext } from '@bace/shared';

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

export function getTenantContext(): TenantContext {
  const ctx = tenantStorage.getStore();
  if (!ctx) {
    throw new Error('TENANT_CONTEXT_MISSING');
  }
  assertTenantId(ctx.tenantId);
  return ctx;
}

export function requireTenantId(): string {
  return getTenantContext().tenantId;
}

export function runWithTenantContext<T>(
  ctx: TenantContext,
  fn: () => T,
): T {
  assertTenantId(ctx.tenantId);
  return tenantStorage.run(ctx, fn);
}
