import { PrismaClient, DbStrategy } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PERMISSIONS, SYSTEM_ROLES } from '@bace/shared';

const prisma = new PrismaClient();

async function main() {
  const tenantName = process.env.SEED_TENANT_NAME ?? 'BACE Internal';
  const tenantSlug = process.env.SEED_TENANT_SLUG ?? 'bace-internal';
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? 'admin@bace.local').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123456';

  const permissionDefs = Object.values(PERMISSIONS).map((code) => ({
    code,
    name: code,
  }));

  for (const p of permissionDefs) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: { name: p.name },
      create: p,
    });
  }

  const tenant = await prisma.tenant.upsert({
    where: { slug: tenantSlug },
    update: { name: tenantName },
    create: {
      name: tenantName,
      slug: tenantSlug,
      planCode: 'internal',
      dbStrategy: DbStrategy.SHARED_RLS,
    },
  });

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { fullName: 'BACE Admin', passwordHash },
    create: {
      email: adminEmail,
      fullName: 'BACE Admin',
      passwordHash,
    },
  });

  const allPermissions = await prisma.permission.findMany();

  const ownerRole = await prisma.role.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: SYSTEM_ROLES.OWNER } },
    update: { name: 'Owner' },
    create: {
      tenantId: tenant.id,
      code: SYSTEM_ROLES.OWNER,
      name: 'Owner',
      isSystem: true,
      description: 'Full access within tenant',
    },
  });

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: ownerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: ownerRole.id,
        permissionId: permission.id,
      },
    });
  }

  const membership = await prisma.membership.upsert({
    where: {
      tenantId_userId: { tenantId: tenant.id, userId: user.id },
    },
    update: { status: 'ACTIVE' },
    create: {
      tenantId: tenant.id,
      userId: user.id,
      status: 'ACTIVE',
    },
  });

  await prisma.membershipRole.upsert({
    where: {
      membershipId_roleId: {
        membershipId: membership.id,
        roleId: ownerRole.id,
      },
    },
    update: {},
    create: {
      membershipId: membership.id,
      roleId: ownerRole.id,
    },
  });

  const pipeline = await prisma.pipeline.findFirst({
    where: { tenantId: tenant.id, isDefault: true },
  });

  if (!pipeline) {
    await prisma.pipeline.create({
      data: {
        tenantId: tenant.id,
        name: 'Default Sales',
        isDefault: true,
        stages: {
          create: [
            { tenantId: tenant.id, name: 'Qualification', position: 1, winProbability: 10 },
            { tenantId: tenant.id, name: 'Proposal', position: 2, winProbability: 40 },
            { tenantId: tenant.id, name: 'Negotiation', position: 3, winProbability: 70 },
            { tenantId: tenant.id, name: 'Closed Won', position: 4, winProbability: 100 },
          ],
        },
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete:', {
    tenant: tenant.slug,
    admin: adminEmail,
    password: adminPassword,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
