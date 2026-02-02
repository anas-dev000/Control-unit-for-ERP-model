# 🗄️ Prisma & Database Management Guide

This guide contains all essential commands for managing the database and Prisma ORM in the Multi-Tenant Accounting System.

> [!IMPORTANT]
> Always run these commands from the `apps/backend` directory.

---

## 🚀 Initialization & Setup

### Install Dependencies
If you have just cloned the project, ensure Prisma dependencies are installed.
```bash
npm install prisma @prisma/client
```

### Setup Environment
Ensure your `.env` file contains the correct `DATABASE_URL`.
```env
DATABASE_URL="postgresql://user:password@localhost:5432/accounting_db?schema=public"
```

---

## 🔄 Migrations & Schema

### Create a Migration
Use this when you change `schema.prisma` and want to apply changes to the database.
```bash
npx prisma migrate dev --name init_schema
```

### Apply Pending Migrations (Production)
In production environments, use `deploy` to apply migrations without reset capabilities.
```bash
npx prisma migrate deploy
```

### Reset Database
**⚠️ CAUTION: THIS WILL WIPE ALL DATA.**
```bash
npx prisma migrate reset
```

---

## 🛠️ Code Generation & Tools

### Generate Prisma Client
Update the TypeScript types to match your current schema.
```bash
npx prisma generate
```

### Prisma Studio (GUI)
Open an interactive web interface to view and edit your data.
```bash
npx prisma studio
```

---

## 🌱 Seeding Data

### Run Database Seed
Populate the database with initial admin users, tenants, and sample customers.
```bash
npm run prisma:seed
# OR
npx tsx prisma/seed.ts
```

---

## 📋 Common Workflow (Fast Track)

If you modify the schema and want to refresh everything:
1. Edit `prisma/schema.prisma`
2. `npx prisma migrate dev` (Applies changes + Auto generates types)
3. `npm run prisma:seed` (Optional: re-populate data)

---

## 🔍 Validation

### Check Schema Validity
```bash
npx prisma validate
```

### Introspect Existing DB
If you have an existing DB and want to generate a Prisma schema from it.
```bash
npx prisma db pull
```
