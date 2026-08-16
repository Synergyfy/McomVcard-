# McomVcard API

NestJS backend with PostgreSQL.

## Quick Start

1. **Install deps**
   ```bash
   pnpm install
   ```

2. **Configure env**
   ```bash
   cp .env.example .env
   # Edit DB_* values if needed
   ```

3. **Start PostgreSQL** (local or Docker)

4. **Run migrations**
   ```bash
   pnpm build
   pnpm migration:run
   ```

5. **Seed admin user**
   ```bash
   pnpm seed
   ```

6. **Run dev server**
   ```bash
   pnpm start:dev
   ```
   API: http://localhost:3001/api
   Docs: http://localhost:3001/api/docs

## Scripts

| Command          | Description                |
|------------------|----------------------------|
| `pnpm start:dev`  | Dev server with TS reload |
| `pnpm build`      | Compile TS                 |
| `pnpm migration:run` | Apply migrations        |
| `pnpm seed`       | Create admin user           |
| `pnpm test`       | Run tests                  |

## Environment Variables

See `.env.example` for required vars (DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, JWT_SECRET, NODE_ENV, etc.).

---

Made with NestJS ❤️