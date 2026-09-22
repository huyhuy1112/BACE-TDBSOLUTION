import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { requireTenantId } from '../../common/tenant/tenant-context';
import { CreateAccountDto } from './dto/create-account.dto';
import { asJson } from '../../common/utils/tenant-data';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    const tenantId = requireTenantId();
    return this.prisma.withTenant((tx) =>
      tx.account.findMany({
        where: { tenantId },
        orderBy: { updatedAt: 'desc' },
      }),
    );
  }

  async get(id: string) {
    const tenantId = requireTenantId();
    const account = await this.prisma.withTenant((tx) =>
      tx.account.findFirst({ where: { id, tenantId } }),
    );
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  create(dto: CreateAccountDto, ownerId: string) {
    const tenantId = requireTenantId();
    return this.prisma.withTenant((tx) =>
      tx.account.create({
        data: {
          tenantId,
          name: dto.name,
          website: dto.website,
          industry: dto.industry,
          phone: dto.phone,
          ownerId,
          customFields: asJson(dto.customFields),
        },
      }),
    );
  }
}
