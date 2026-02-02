# API Documentation - AccFlow ERP

## Base URL
`http://localhost:5000/api`

## Authentication
All requests except `/auth/login` and `/auth/register` require a Bearer token in the `Authorization` header.

### Endpoints

#### Auth
- `POST /auth/register`: Create new tenant and admin user.
- `POST /auth/login`: Authenticate and receive tokens.
- `POST /auth/refresh`: Get new access token using refresh token.

#### Customers
- `GET /customers`: List all customers (paginated).
- `POST /customers`: Create a new customer.
- `GET /customers/:id/statement`: Get customer ledger and balance summary.

#### Invoices
- `GET /invoices`: List invoices.
- `POST /invoices`: Create multi-item invoice (calculates tax).
- `GET /invoices/:id/pdf`: Generate and download PDF.

#### Payments
- `GET /payments`: List transaction history.
- `POST /payments`: Record a payment (updates invoice status).

#### Dashboard
- `GET /dashboard/summary`: High-level metrics.
- `GET /dashboard/aging`: Aging report distribution.

## Error Codes
- `VALIDATION_ERROR` (400): Invalid request body.
- `UNAUTHORIZED` (401): Missing or invalid token.
- `FORBIDDEN` (403): Role-based permission denied.
- `NOT_FOUND` (404): Resource doesn't exist.
- `CONFLICT` (409): Duplicate entry (e.g. Email).
