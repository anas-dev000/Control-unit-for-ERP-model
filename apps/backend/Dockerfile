# ==========================================
# 1. Build Stage
# ==========================================
FROM node:20-slim AS build

# Install OpenSSL for Prisma generation in build stage
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies strictly (including devDependencies for build & prisma)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client (uses schema.prisma)
RUN npx prisma generate

# Build the application
RUN npm run build

# ==========================================
# 2. Production Stage
# ==========================================
FROM node:20-slim AS production

# Install OpenSSL (Required by Prisma Client at runtime) and Curl (for healthcheck)
RUN apt-get update -y && \
    apt-get install -y openssl curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm install --omit=dev

# Copy compiled code from build stage
COPY --from=build /app/dist ./dist

# Copy Prisma schema and GENERATED engine/client from build stage
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
