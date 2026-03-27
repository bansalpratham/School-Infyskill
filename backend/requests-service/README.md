# requests-service

Production-ready **Requests Service** microservice built with:
- Node.js
- Express.js
- MongoDB + Mongoose
- REST API

This service handles leave/document requests with an approval workflow.
No auth logic is included (assume API Gateway validates JWT).

## Setup

### 1) Install dependencies
```bash
pnpm i
```

### 2) Configure environment variables
Create a `.env` file in the project root (sample provided):
```bash
NODE_ENV=development
PORT=4008
MONGODB_URI=mongodb://localhost:27017/requests_service
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

Base path: `/api/requests`

- `POST /api/requests`  
  Create a new request.

- `GET /api/requests`  
  List requests with pagination and optional filters.
  Query params:
  - `page` (default `1`)
  - `limit` (default `10`, max `100`)
  - `userId` (exact match)
  - `type` (`LEAVE` | `DOCUMENT`)
  - `status` (`PENDING` | `APPROVED` | `REJECTED`)

- `PATCH /api/requests/:id/approve`  
  Approve request (only from `PENDING`).

- `PATCH /api/requests/:id/reject`  
  Reject request (only from `PENDING`).

## Model

- `userId`
- `type` (`LEAVE` | `DOCUMENT`)
- `reason`
- `status` (`PENDING` | `APPROVED` | `REJECTED`)
- `createdAt`, `updatedAt`
