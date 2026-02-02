# Base stage for shared dependencies
FROM node:20-slim AS base
WORKDIR /app
RUN npm install -g pnpm

# Backend build stage
FROM base AS backend-build
COPY apps/backend/package.json ./apps/backend/
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY apps/backend ./apps/backend
RUN cd apps/backend && npx prisma generate && npm run build

# Frontend build stage
FROM base AS frontend-build
COPY apps/frontend/package.json ./apps/frontend/
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY apps/frontend ./apps/frontend
RUN cd apps/frontend && npm run build

# Final production stage
FROM node:20-slim
WORKDIR /app
RUN npm install -g pnpm

COPY --from=backend-build /app/apps/backend/dist ./dist
COPY --from=backend-build /app/apps/backend/package.json ./
COPY --from=backend-build /app/apps/backend/node_modules ./node_modules
COPY --from=backend-build /app/apps/backend/prisma ./prisma
COPY --from=frontend-build /app/apps/frontend/dist ./public

EXPOSE 5000
CMD ["pnpm", "start"]
