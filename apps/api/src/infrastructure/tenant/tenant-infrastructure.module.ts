import { Module } from '@nestjs/common';
import { TenantConnectionResolver } from './tenant-connection.resolver';

@Module({
  providers: [TenantConnectionResolver],
  exports: [TenantConnectionResolver],
})
export class TenantInfrastructureModule {}
