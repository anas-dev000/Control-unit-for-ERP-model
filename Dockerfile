# Base stage
FROM node:20-slim AS base
WORKDIR /app

# Backend Build Stage
FROM base AS backend-build
WORKDIR /app/apps/backend
COPY apps/backend/package*.json ./
RUN npm install
COPY apps/backend ./
RUN npx prisma generate
RUN npm run build

# Frontend Build Stage
FROM base AS frontend-build
WORKDIR /app/apps/frontend
COPY apps/frontend/package*.json ./
RUN npm install
COPY apps/frontend ./
RUN npm run build

# Production Stage
FROM node:20-slim
WORKDIR /app

# Copy backend artifacts
COPY --from=backend-build /app/apps/backend/dist ./dist
COPY --from=backend-build /app/apps/backend/package*.json ./
COPY --from=backend-build /app/apps/backend/node_modules ./node_modules
COPY --from=backend-build /app/apps/backend/prisma ./prisma

# Copy frontend artifacts
COPY --from=frontend-build /app/apps/frontend/dist ./public

EXPOSE 5000
CMD ["npm", "start"]
