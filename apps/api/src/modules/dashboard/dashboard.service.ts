import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { requireTenantId } from '../../common/tenant/tenant-context';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const tenantId = requireTenantId();
    return this.prisma.withTenant(async (tx) => {
      const [
        accounts,
        contacts,
        leads,
        openDeals,
        wonDeals,
        activitiesOpen,
        recentLeads,
        recentDeals,
      ] = await Promise.all([
        tx.account.count({ where: { tenantId } }),
        tx.contact.count({ where: { tenantId } }),
        tx.lead.count({ where: { tenantId } }),
        tx.deal.count({ where: { tenantId, status: 'OPEN' } }),
        tx.deal.count({ where: { tenantId, status: 'WON' } }),
        tx.activity.count({
          where: { tenantId, completedAt: null },
        }),
        tx.lead.findMany({
          where: { tenantId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        }),
        tx.deal.findMany({
          where: { tenantId },
          take: 5,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            title: true,
            amount: true,
            currency: true,
            status: true,
            stage: { select: { name: true } },
          },
        }),
      ]);

      const pipelineValue = await tx.deal.aggregate({
        where: { tenantId, status: 'OPEN' },
        _sum: { amount: true },
      });

      return {
        counts: {
          accounts,
          contacts,
          leads,
          openDeals,
          wonDeals,
          activitiesOpen,
        },
        pipelineValue: pipelineValue._sum.amount ?? 0,
        recentLeads,
        recentDeals,
      };
    });
  }
}
