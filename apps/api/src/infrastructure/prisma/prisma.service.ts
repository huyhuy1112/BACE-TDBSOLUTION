import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { requireTenantId } from '../../common/tenant/tenant-context';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Runs fn inside a transaction with Postgres session var app.tenant_id set for RLS.
   * Every business write/read for shared_rls should go through this.
   */
  async withTenant<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
    const tenantId = requireTenantId();
    return this.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `SELECT set_config('app.tenant_id', $1, true)`,
        tenantId,
      );
      return fn(tx as unknown as PrismaClient);
    });
  }
}
