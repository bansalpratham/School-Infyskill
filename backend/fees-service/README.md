# fees-service

Production-ready **Fees Service** microservice built with:
- Node.js
- Express.js
- MongoDB + Mongoose
- REST API

This service is **JWT-ready** but does **not** implement login/authentication.
Assume an API Gateway validates JWT and forwards requests.

## Responsibilities

- Maintain student fee records
- Track `PAID`, `PARTIAL`, `PENDING`
- Provide dashboard-ready summary API

## Setup

### 1) Install dependencies
```bash
pnpm i
```

### 2) Configure environment variables
Create a `.env` file in the project root (sample provided):
```bash
NODE_ENV=development
PORT=4004
MONGODB_URI=mongodb://localhost:27017/fees_service
```

### 3) Run
Development:
```bash
pnpm dev
```

Production:
```bash
pnpm start
```

Health check:
- `GET /health`

## API

Base path: `/api/fees`

- `POST /api/fees`  
  Create a fee record for a student.

- `GET /api/fees`  
  List fee records with pagination and filters.
  Query params:
  - `page` (default `1`)
  - `limit` (default `10`, max `100`)
  - `status` (`PAID` | `PARTIAL` | `PENDING`)
  - `studentId` (exact match)

- `GET /api/fees/student/:studentId`  
  Get fee records for a given student.

- `PATCH /api/fees/:id/pay`  
  Apply a payment to a fee record.

- `GET /api/fees/summary`  
  Dashboard summary:
  - counts by status
  - totals for `totalAmount`, `paidAmount`, `balanceAmount`

## Notes

- Amount fields are stored as numbers.
- `balanceAmount` and `status` are recalculated whenever payments are applied.
