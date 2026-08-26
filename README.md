# McomVcard Application

A monorepo containing both backend API (NestJS) and frontend (React/App Router) components for the Mcomvcard platform.

## Table of Contents

1. [Monorepo Structure](#monorepo-structure)
2. [Prerequisites](#prerequisites)
3. [Setup & Configuration](#setup)
4. [Running Applications](#running-applications)
5. [Database Setup](#database)
6. [Common Commands](#common-commands)
7. [Folder Structure](#folder-structure)

---

## Monorepo Structure
This project uses the Turborepo monorepo structure with independent packages:

- **apps/api** (NestJS backend API)
- **apps/web** (React frontend)
- **apps/features/** (Potential future features)

Shared code lives in `packages/` directory. Builds are monorepo-optimized for faster incremental updates.

## Prerequisites
- Node.js (v18+ or pnpm)
- PostgreSQL (v13+) or Docker
- Git

## Setup & Configuration
1. Clone repo
   ```bash
   git clone https://github.com/your-org/mcomvcard.git
   cd mcomvcard
   ```
2. Install dependencies
   ```bash
   pnpm install
   ```
3. Configure environment
   ```bash
   cp .env.example .env
   # Customize DB credentials if needed
   ```

## Running Applications
Start both the API and web app together:
   ```bash
   pnpm dev
   ```

### API
Start development server:
   ```bash
   pnpm dev:api
   ```
Available at: http://localhost:3001/api

### Web App
Start development server:
   ```bash
   pnpm dev:web
   ```
Available at: http://localhost:3000

## Database Setup
Configure PostgreSQL locally or via Docker:
1. Start PostgreSQL (local):
   ```bash
   psql -U postgres -p 5432 -d mcomvcard
   ```
2. Or use Docker:
   ```bash
   docker run -d -p 5432:5432 -e POSTGRES_DB=mcomvcard -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres postgres:13
   ```

## Common Commands
| Command                | Purpose                          |
|------------------------|----------------------------------|
| `pnpm dev`             | Start API + web dev servers      |
| `pnpm dev:api`         | Start API dev server             |
| `pnpm dev:web`         | Start web dev server             |
| `pnpm build`           | Full monorepo build              |
| `pnpm build:api`       | Build API only                   |
| `pnpm build:web`       | Build web only                   |
| `pnpm migrate`         | Apply migrations                 |
| `pnpm seed`            | Create admin user                |

## Folder Structure
```
.\                                                                                             # Project root
├── apps/\                                                                                     # Application packages
│   ├── api/\                                                                                   # NestJS backend
│   │   └── src/\                                                                              # API source code
│   └── web/\                                                                                  # React frontend
│       └── src/\                                                                              # Web source code
├── packages/\                                                                                 # Shared libraries
├── data/\                                                                                     # Local PostgreSQL instance
├── .env.example\                                                                              # Environment variables template
└── README.md\                                                                                 # This file
```

## Notes
1. **Database Shared**: Both API and web components share the same PostgreSQL database
2. **Turborepo**: Enables fast incremental builds across packages
3. **TypeScript**: Used throughout for type safety
4. **Tests**: Run with `pnpm test:api` or `pnpm test:web`
