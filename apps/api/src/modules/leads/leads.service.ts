import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { requireTenantId } from '../../common/tenant/tenant-context';
import { asJson } from '../../common/utils/tenant-data';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  list(status?: LeadStatus, q?: string) {
    const tenantId = requireTenantId();
    return this.prisma.withTenant((tx) =>
      tx.lead.findMany({
        where: {
          tenantId,
          ...(status ? { status } : {}),
          ...(q
            ? {
                OR: [
                  { title: { contains: q, mode: 'insensitive' } },
                  { source: { contains: q, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          account: { select: { id: true, name: true } },
          contact: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
    );
  }

  async get(id: string) {
    const tenantId = requireTenantId();
    const lead = await this.prisma.withTenant((tx) =>
      tx.lead.findFirst({
        where: { id, tenantId },
        include: { account: true, contact: true },
      }),
    );
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  create(dto: CreateLeadDto, ownerId: string) {
    const tenantId = requireTenantId();
    return this.prisma.withTenant((tx) =>
      tx.lead.create({
        data: {
          tenantId,
          title: dto.title,
          status: dto.status ?? LeadStatus.NEW,
          source: dto.source,
          accountId: dto.accountId,
          contactId: dto.contactId,
          ownerId,
          customFields: asJson(dto.customFields),
        },
      }),
    );
  }

  async update(id: string, dto: UpdateLeadDto) {
    const tenantId = requireTenantId();
    await this.get(id);
    return this.prisma.withTenant((tx) =>
      tx.lead.update({
        where: { id },
        data: {
          ...(dto.title !== undefined ? { title: dto.title } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.source !== undefined ? { source: dto.source } : {}),
          ...(dto.accountId !== undefined ? { accountId: dto.accountId } : {}),
          ...(dto.contactId !== undefined ? { contactId: dto.contactId } : {}),
          ...(dto.customFields !== undefined
            ? { customFields: asJson(dto.customFields) }
            : {}),
          // ensure tenant scoping even on update path
          tenantId,
        },
      }),
    );
  }
}
