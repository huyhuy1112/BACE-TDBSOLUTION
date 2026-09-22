# BACE-TDBSOLUTION

Multi-tenant CRM SaaS — Phase 1 local stack (tenant-ready architecture).

## Stack

- **Web:** Next.js 15 + TanStack Query + Framer Motion
- **API:** NestJS + Prisma + PostgreSQL (RLS-ready)
- **Infra local:** Docker Compose → Postgres 16, Redis 7, MinIO

## Quick start

```bash
cp .env.example .env
npm install
npm run docker:up
npm run db:generate -w @bace/api
cp .env apps/api/.env   # Prisma reads apps/api/.env
npm run prisma:migrate -w @bace/api -- --name init
npm run db:seed
# optional RLS policies (after migrate)
# docker exec -i bace-postgres psql -U bace -d bace_crm < apps/api/prisma/rls.sql

# terminals
npm run dev:api
npm run dev:web
```

- Web: http://localhost:3000  
- API: http://localhost:3001/api/health  
- Postgres host port: **5433** (avoids conflict with local 5432)  
- Seed login: `admin@bace.local` / `Admin@123456`

## Architecture invariants

1. Every business query requires `tenant_id` (ALS context + Prisma `withTenant` + RLS).
2. `Tenant.dbStrategy` supports `SHARED_RLS` now; `SHARED_RLS_CACHE` / `DEDICATED` later without rewriting domain modules.
3. Auth = JWT access + refresh hash; RBAC via roles/permissions per membership.

## Monorepo layout

```
apps/api        NestJS API
apps/web        Next.js UI
packages/shared Shared types + permission codes
```

## Roadmap (next)

Leads → Pipeline/Deals → Activities → Search → Dashboard analytics
