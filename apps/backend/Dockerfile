# Build Stage
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Production Stage
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
# Prisma requires schema for client runtime
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 5000
CMD ["npm", "start"]
