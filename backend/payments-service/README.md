# payments-service

Production-ready **Payments Service** microservice built with:
- Node.js
- Express.js
- MongoDB + Mongoose
- REST API

This service stores **payment transactions** for receipts and reports.
No payment gateway integration is included.

## Setup

### 1) Install dependencies
```bash
pnpm i
```

### 2) Configure environment variables
Create a `.env` file in the project root (sample provided):
```bash
NODE_ENV=development
PORT=4005
MONGODB_URI=mongodb://localhost:27017/payments_service
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

Base path: `/api/payments`

- `POST /api/payments`  
  Create a payment transaction.

- `GET /api/payments`  
  List payments with pagination and optional filters.
  Query params:
  - `page` (default `1`)
  - `limit` (default `10`, max `100`)
  - `studentId` (exact match)

- `GET /api/payments/student/:studentId`  
  Get all payments for a student (latest first).

## Model

- `studentId` (string)
- `amount` (number)
- `paymentMode` (string)
- `transactionId` (string)
- `createdAt` (timestamp)

## Notes

- No auth logic is included.
- `transactionId` is unique (prevents duplicate receipt imports).
