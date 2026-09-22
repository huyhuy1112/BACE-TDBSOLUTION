import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getTenantContext } from '../tenant/tenant-context';

export const CurrentTenant = createParamDecorator(
  (_data: unknown, _ctx: ExecutionContext) => getTenantContext(),
);
