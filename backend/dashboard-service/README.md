# dashboard-service

Production-ready **Dashboard Service** microservice built with:
- Node.js
- Express.js
- Axios (service-to-service calls)

This service aggregates data from:
- `student-service`
- `teacher-service`
- `fees-service`
- `payments-service`

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
PORT=4010

STUDENT_SERVICE_URL=http://localhost:4002
TEACHER_SERVICE_URL=http://localhost:4003
FEES_SERVICE_URL=http://localhost:4004
PAYMENTS_SERVICE_URL=http://localhost:4005

SERVICE_TIMEOUT_MS=2500
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

Health:
- `GET /health`

## API

Base path: `/api/dashboard`

- `GET /api/dashboard/overview`

### Response behavior

- Uses **parallel** calls to downstream services.
- If one service fails, response still returns `200` with `errors` field showing which dependency failed.
