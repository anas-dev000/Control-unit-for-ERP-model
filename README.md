# Multi-Tenant Accounting System

A production-ready, highly isolated multi-tenant accounting platform built with Node.js, PostgreSQL, Prisma, and React.

## 🚀 Key Features
- **Strict Tenant Isolation**: shared database with row-level isolation via middleware and AsyncLocalStorage.
- **Full Auth Module**: JWT-based authentication (RS256) with registration and login.
- **Customer Management**: Detailed ledger and contact tracking.
- **Invoice Engine**: Professional invoice creation with 15% tax calculation (high precision).
- **Payment Tracking**: Record partial or full payments against invoices.
- **Premium UI**: Modern, responsive dashboard with dark-mode elements and analytical charts.

## 🛠️ Tech Stack
- **Backend**: Express, TypeScript, Prisma, PostgreSQL, Zod, JWT, Decimal.js.
- **Frontend**: Vite, React, TypeScript, Tailwind CSS, TanStack Query, Recharts, Lucide.

## 📥 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL instance

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>
cd multi-tenant-accounting

# Install dependencies (backend)
cd apps/backend
npm install

# Install dependencies (frontend)
cd ../frontend
npm install
```

### 3. Database Setup
```bash
# Set up .env in apps/backend
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Seed initial data
npx prisma db seed
```

### 4. Running the App
```bash
# Backend (from apps/backend)
npm run dev

# Frontend (from apps/frontend)
npm run dev
```

## 🔐 Security 
- **Row-Level Isolation**: Every query is automatically scoped to the user's `tenantId`.
- **Validation**: Strict schema validation on every request using Zod.
- **JWT**: Secure token handling with HttpOnly cookie support planned.

## 📈 Roadmap
- [ ] Export invoices to PDF.
- [ ] Multi-currency support.
- [ ] Activity logs for audit.
- [ ] RBAC for custom roles.

## 📄 License
MIT
