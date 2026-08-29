# ──────────────────────────────────────────────
# MCOM API — Multi-stage Docker build
# ──────────────────────────────────────────────

# Stage 1: Build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install deps first (layer caching)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN pnpm run build

# Stage 2: Production
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

# Non-root user
RUN addgroup -g 1001 -S mcom && adduser -S mcom -u 1001

WORKDIR /app

# Install production deps only
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts
COPY --from=builder /app/dist ./dist

# Uploads directory (if any local uploads exist)
RUN mkdir -p /app/uploads/media && chown -R mcom:mcom /app

USER mcom

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
