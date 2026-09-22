import { Injectable } from '@nestjs/common';
import { DbStrategy } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Resolves DB strategy per tenant.
 * Phase 1: all tenants use shared_rls.
 * Later: dedicated connection strings for enterprise without changing domain code.
 */
@Injectable()
export class TenantConnectionResolver {
  constructor(private readonly prisma: PrismaService) {}

  async resolveStrategy(tenantId: string): Promise<DbStrategy> {
    if (!tenantId) {
      throw new Error('TENANT_ID_REQUIRED');
    }
    const tenant = await this.prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
      select: { dbStrategy: true },
    });
    return tenant.dbStrategy;
  }
}
