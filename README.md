# Multi-Tenant Accounting System

A production-ready, highly isolated multi-tenant accounting platform built with Node.js, PostgreSQL, Prisma, and React.

## 🚀 Key Features
- **Strict Tenant Isolation**: Shared database with row-level isolation via middleware and AsyncLocalStorage.
- **Full Auth Module**: JWT-based authentication (RS256) with registration and login.
- **Customer Management**: Detailed ledger and contact tracking.
- **Invoice Engine**: Professional invoice creation with 15% tax calculation (high precision).
- **Payment Tracking**: Record partial or full payments against invoices.
- **Premium UI**: Modern, responsive dashboard with dark-mode elements and analytical charts.

## 🛠️ Tech Stack
- **Backend**: Express, TypeScript, Prisma, PostgreSQL, Zod, JWT, Decimal.js.
- **Frontend**: Vite, React, TypeScript, Tailwind CSS, TanStack Query, Recharts, Lucide.

---

## 📥 Getting Started

You can run this project in two ways:
1. **Local Setup** (Recommended for development)
2. **Docker Setup** (Recommended for quick testing/deployment)

### Option 1: Local Setup (Development)

**Prerequisites:**
- Node.js (v18+)
- PostgreSQL instance running locally

#### 1. Clone & Install
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

#### 2. Database Setup
Ensure your local PostgreSQL is running and update `apps/backend/.env` with your credentials.

```bash
# Set up .env in apps/backend
cd apps/backend
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Seed initial data (optional but recommended)
npx prisma db seed
```

#### 3. Run the App
You will need two terminal windows:

**Terminal 1 (Backend):**
```bash
cd apps/backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd apps/frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the app.

---

### Option 2: Docker Setup (Quick Start)

**Prerequisites:**
- Docker & Docker Compose installed

This method automatically sets up the database and application containers.

#### 1. Run with Docker Compose
```bash
# From the root directory
docker-compose up --build
```

The app will be available at [http://localhost:5000](http://localhost:5000) (serving frontend assets via backend) or you can configure it to serve separately.

*Note: The current Docker setup serves the backend on port 5000. For full development experience with hot-reload, Option 1 is recommended.*

---

## 🔐 Security 
- **Row-Level Isolation**: Every query is automatically scoped to the user's `tenantId`.
- **Validation**: Strict schema validation on every request using Zod.
- **JWT**: Secure token handling with HttpOnly cookie support planned.
