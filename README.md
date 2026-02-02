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
- **Infrastructure**: Docker, Nginx, PostgreSQL (Alpine).

---

## 📥 Getting Started

You can run this project in two ways:
1. **Docker Setup** (Recommended for easiest startup)
2. **Local Setup** (Recommended for active development)

### Option 1: Docker Setup (Recommended)

**Prerequisites:**
- Docker & Docker Compose installed

This method orchestrates the database, backend, and frontend containers automatically.

#### 1. Optimization (First Run Only)
We use specific `.dockerignore` files to keep builds fast.
```bash
# Verify you are in the root directory
```

#### 2. Run the App
```bash
# Build and start all services
docker-compose up --build
```

#### 3. Initial Setup (One-Time Only)
After the containers are running, you **must** seed the database to create the default admin user:
```bash
# Run this in a new terminal window at the project root
docker-compose exec backend node dist/prisma/seed.js
```

#### 3. Visit the App
- **Frontend (UI)**: [http://localhost:5173](http://localhost:5173)
- **Backend (API)**: [http://localhost:5000](http://localhost:5000)

**Default Credentials:**
- **Email**: `admin@acme.com`
- **Password**: `password123`

---

### Option 2: Local Setup (Development)

**Prerequisites:**
- Node.js (v18+)
- PostgreSQL instance running locally

#### 1. Clone & Install
```bash
git clone <repo-url>
cd multi-tenant-accounting

# Install Backend Dependencies
cd apps/backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

#### 2. Database Setup
Ensure your local PostgreSQL is running and update `apps/backend/.env`.

```bash
# Setup Environment Variables
cd apps/backend
cp .env.example .env
# Edit .env with your local DB credentials

# Run Migrations & Seed
npx prisma migrate dev
npx prisma db seed
```

#### 3. Run Development Servers
You need two terminal windows:

**Terminal 1 (Backend):**
```bash
cd apps/backend
npm run dev
# Server running at http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd apps/frontend
npm run dev
# Client running at http://localhost:5173
```

---

## 📂 Project Structure

```
├── apps/
│   ├── backend/        # Express API (Node.js)
│   │   ├── Dockerfile  # Backend-specific Docker build
│   │   └── src/        # API Source Code
│   │
│   └── frontend/       # React App (Vite)
│       ├── Dockerfile  # Frontend-specific Docker build
│       └── nginx.conf  # Nginx routing configuration
│
├── docker-compose.yml  # Orchestration service definition
└── README.md           # Documentation
```

## 🔐 Security 
- **Row-Level Isolation**: Every query is automatically scoped to the user's `tenantId`.
- **Validation**: Strict schema validation on every request using Zod.
- **JWT**: Secure token handling.
