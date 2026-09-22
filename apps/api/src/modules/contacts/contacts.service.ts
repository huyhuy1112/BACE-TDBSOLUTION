import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { requireTenantId } from '../../common/tenant/tenant-context';
import { CreateContactDto } from './dto/create-contact.dto';
import { asJson } from '../../common/utils/tenant-data';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    const tenantId = requireTenantId();
    return this.prisma.withTenant((tx) =>
      tx.contact.findMany({
        where: { tenantId },
        orderBy: { updatedAt: 'desc' },
        include: { account: { select: { id: true, name: true } } },
      }),
    );
  }

  async get(id: string) {
    const tenantId = requireTenantId();
    const contact = await this.prisma.withTenant((tx) =>
      tx.contact.findFirst({
        where: { id, tenantId },
        include: { account: true },
      }),
    );
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return contact;
  }

  create(dto: CreateContactDto, ownerId: string) {
    const tenantId = requireTenantId();
    return this.prisma.withTenant((tx) =>
      tx.contact.create({
        data: {
          tenantId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          phone: dto.phone,
          title: dto.title,
          accountId: dto.accountId,
          ownerId,
          customFields: asJson(dto.customFields),
        },
      }),
    );
  }
}
