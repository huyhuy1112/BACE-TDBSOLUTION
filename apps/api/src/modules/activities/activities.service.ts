import { Injectable, NotFoundException } from '@nestjs/common';
import { ActivityType } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { requireTenantId } from '../../common/tenant/tenant-context';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  list(type?: ActivityType) {
    const tenantId = requireTenantId();
    return this.prisma.withTenant((tx) =>
      tx.activity.findMany({
        where: {
          tenantId,
          ...(type ? { type } : {}),
        },
        orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
        include: {
          account: { select: { id: true, name: true } },
          contact: {
            select: { id: true, firstName: true, lastName: true },
          },
          deal: { select: { id: true, title: true } },
        },
      }),
    );
  }

  create(dto: CreateActivityDto, ownerId: string) {
    const tenantId = requireTenantId();
    return this.prisma.withTenant((tx) =>
      tx.activity.create({
        data: {
          tenantId,
          type: dto.type,
          subject: dto.subject,
          body: dto.body,
          dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
          accountId: dto.accountId,
          contactId: dto.contactId,
          dealId: dto.dealId,
          ownerId,
        },
      }),
    );
  }

  async complete(id: string) {
    const tenantId = requireTenantId();
    return this.prisma.withTenant(async (tx) => {
      const activity = await tx.activity.findFirst({ where: { id, tenantId } });
      if (!activity) throw new NotFoundException('Activity not found');
      return tx.activity.update({
        where: { id },
        data: { tenantId, completedAt: new Date() },
      });
    });
  }
}
