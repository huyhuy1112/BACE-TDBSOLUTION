import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { requireTenantId } from '../../common/tenant/tenant-context';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(q: string) {
    const tenantId = requireTenantId();
    const query = q?.trim();
    if (!query) {
      return { accounts: [], contacts: [], leads: [], deals: [] };
    }

    return this.prisma.withTenant(async (tx) => {
      const [accounts, contacts, leads, deals] = await Promise.all([
        tx.account.findMany({
          where: {
            tenantId,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { industry: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 10,
          orderBy: { updatedAt: 'desc' },
        }),
        tx.contact.findMany({
          where: {
            tenantId,
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 10,
          orderBy: { updatedAt: 'desc' },
        }),
        tx.lead.findMany({
          where: {
            tenantId,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { source: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 10,
          orderBy: { updatedAt: 'desc' },
        }),
        tx.deal.findMany({
          where: {
            tenantId,
            title: { contains: query, mode: 'insensitive' },
          },
          take: 10,
          orderBy: { updatedAt: 'desc' },
          include: { stage: { select: { name: true } } },
        }),
      ]);

      return { accounts, contacts, leads, deals };
    });
  }
}
