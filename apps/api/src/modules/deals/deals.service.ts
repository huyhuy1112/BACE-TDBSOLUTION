import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { requireTenantId } from '../../common/tenant/tenant-context';
import { asJson } from '../../common/utils/tenant-data';
import { CreateDealDto, MoveDealDto } from './dto/deal.dto';

@Injectable()
export class DealsService {
  constructor(private readonly prisma: PrismaService) {}

  listPipelines() {
    const tenantId = requireTenantId();
    return this.prisma.withTenant((tx) =>
      tx.pipeline.findMany({
        where: { tenantId },
        include: {
          stages: { orderBy: { position: 'asc' } },
        },
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      }),
    );
  }

  listDeals(pipelineId?: string) {
    const tenantId = requireTenantId();
    return this.prisma.withTenant((tx) =>
      tx.deal.findMany({
        where: {
          tenantId,
          ...(pipelineId ? { pipelineId } : {}),
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          stage: true,
          account: { select: { id: true, name: true } },
          contact: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
    );
  }

  async board(pipelineId?: string) {
    const tenantId = requireTenantId();
    return this.prisma.withTenant(async (tx) => {
      const pipeline = pipelineId
        ? await tx.pipeline.findFirst({
            where: { id: pipelineId, tenantId },
            include: { stages: { orderBy: { position: 'asc' } } },
          })
        : await tx.pipeline.findFirst({
            where: { tenantId, isDefault: true },
            include: { stages: { orderBy: { position: 'asc' } } },
          });

      if (!pipeline) {
        throw new NotFoundException('Pipeline not found');
      }

      const deals = await tx.deal.findMany({
        where: { tenantId, pipelineId: pipeline.id, status: 'OPEN' },
        include: {
          account: { select: { id: true, name: true } },
          contact: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return {
        pipeline,
        columns: pipeline.stages.map((stage) => ({
          stage,
          deals: deals.filter((d) => d.stageId === stage.id),
        })),
      };
    });
  }

  async create(dto: CreateDealDto, ownerId: string) {
    const tenantId = requireTenantId();
    return this.prisma.withTenant(async (tx) => {
      const stage = await tx.pipelineStage.findFirst({
        where: {
          id: dto.stageId,
          pipelineId: dto.pipelineId,
          tenantId,
        },
      });
      if (!stage) {
        throw new BadRequestException('Invalid pipeline stage');
      }

      return tx.deal.create({
        data: {
          tenantId,
          title: dto.title,
          pipelineId: dto.pipelineId,
          stageId: dto.stageId,
          amount: dto.amount,
          currency: dto.currency ?? 'VND',
          accountId: dto.accountId,
          contactId: dto.contactId,
          expectedClose: dto.expectedClose
            ? new Date(dto.expectedClose)
            : undefined,
          ownerId,
          customFields: asJson(dto.customFields),
        },
        include: { stage: true },
      });
    });
  }

  async move(id: string, dto: MoveDealDto) {
    const tenantId = requireTenantId();
    return this.prisma.withTenant(async (tx) => {
      const deal = await tx.deal.findFirst({ where: { id, tenantId } });
      if (!deal) throw new NotFoundException('Deal not found');

      const stage = await tx.pipelineStage.findFirst({
        where: {
          id: dto.stageId,
          pipelineId: deal.pipelineId,
          tenantId,
        },
      });
      if (!stage) {
        throw new BadRequestException('Invalid stage for this pipeline');
      }

      return tx.deal.update({
        where: { id },
        data: {
          tenantId,
          stageId: dto.stageId,
          ...(dto.status ? { status: dto.status } : {}),
        },
        include: { stage: true },
      });
    });
  }
}
