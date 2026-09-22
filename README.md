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

## Deploy on cPanel (Node 16.20.2, UI hạn chế)

Host không có virtualenv/SSH? Dùng nút trên **Setup Node.js App**.

### Env (bắt buộc)

| Name | Value |
|------|--------|
| `NODE_ENV` | `development` (hoặc `production`) |
| `NPM_CONFIG_PRODUCTION` | `false` |
| `NEXT_PUBLIC_API_URL` | `https://api-bace.tdbsolution.com/api` |

### Node app

- Node: **16.20.2**
- Application root / URL: `bace-tdbsolution.tdbsolution.com`
- Startup file: **`app.js`**

### Thứ tự nút trên UI

1. **Pull** code mới từ GitHub (`huy-dev`)
2. **SAVE** env
3. **Run NPM Install** — đợi xong; trong File Manager, `node_modules` phải có folder `next`, `.bin`, … (không chỉ 1 file `package.json`)
4. Chạy script NPM **`build`** (root) — giờ chỉ build **shared + web** (không build Nest API)
5. **Restart** application

> Nếu Install xong mà `node_modules` vẫn gần trống → host chặn/timeout npm; khi đó cần zip từ Linux hoặc VPS (không commit `node_modules` lên GitHub).

### API (second Node app)

- Startup: **`api.js`**
- Script: `build:api` sau khi có Postgres
- Env: `DATABASE_URL`, `JWT_*`, `WEB_URL`

## Architecture invariants

1. Every business query requires `tenant_id`.
2. `Tenant.dbStrategy` ready for Free / Growth / Enterprise later.
3. Auth = JWT + RBAC per membership.

## Monorepo layout

```
app.js              cPanel Next startup
api.js              cPanel Nest startup
index.html          LiteSpeed static fallback
apps/api            NestJS API
apps/web            Next.js UI
packages/shared     Shared types + permissions
```
