# BACE-TDBSOLUTION

Multi-tenant CRM SaaS — Phase 1 (tenant-ready). **Target runtime: Node.js 16.20+** (cPanel max).

## Stack

- **Web:** Next.js **13.5** + React 18 + TanStack Query + Framer Motion + Tailwind 3
- **API:** NestJS **10** + Prisma **5** + PostgreSQL (RLS-ready)
- **Infra local:** Docker Compose → Postgres 16, Redis 7, MinIO
- **cPanel entry:** `app.js` (web), `api.js` (API, optional second Node app)
- **Static fallback:** `index.html` (LiteSpeed hết 404 khi Node chưa chạy)

## Quick start (local)

```bash
cp .env.example .env
npm install
npm run docker:up
npm run db:generate -w @bace/api
cp .env apps/api/.env
cd apps/api && npx prisma migrate deploy && cd ../..
npm run db:seed

npm run dev:api
npm run dev:web
```

- Web: http://localhost:3000  
- API: http://localhost:3001/api/health  
- Postgres host port: **5433**  
- Seed: `admin@bace.local` / `Admin@123456`

## Deploy on cPanel (Node 16.20.2)

1. Pull latest code into `bace-tdbsolution.tdbsolution.com` folder.
2. **Setup Node.js App**
   - Node: **16.20.2**
   - Mode: **Production**
   - Application root: `bace-tdbsolution.tdbsolution.com`
   - Application URL: `bace-tdbsolution.tdbsolution.com` (empty path)
   - Startup file: **`app.js`**
3. Open the virtualenv terminal from the Node app UI (or SSH), then:

```bash
npm install
npm run build -w @bace/shared
npm run build -w @bace/web
```

4. Set env vars in the Node app (at least `NODE_ENV=production`, `NEXT_PUBLIC_API_URL=...`).
5. **Restart** the application.

### API (second Node app, recommended)

- Startup file: **`api.js`**
- Build first: `npm run build -w @bace/api` (+ Prisma generate/migrate against host Postgres)
- Env: `DATABASE_URL`, `JWT_*`, `WEB_URL`, `PORT` (cPanel sets PORT)

> Shared cPanel often has **MySQL only**. This app needs **PostgreSQL**. Without Postgres, API cannot run on that host.

## Architecture invariants

1. Every business query requires `tenant_id`.
2. `Tenant.dbStrategy` ready for Free / Growth / Enterprise later.
3. Auth = JWT + RBAC per membership.

## Monorepo layout

```
app.js              cPanel Next startup
api.js              cPanel Nest startup
apps/api            NestJS API
apps/web            Next.js UI
packages/shared     Shared types + permissions
```
