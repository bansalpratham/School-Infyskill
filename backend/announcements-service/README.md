# announcements-service

Production-ready **Announcements Service** microservice built with:
- Node.js
- Express.js
- MongoDB + Mongoose
- REST API

This service publishes announcements targeted to audiences.
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
PORT=4007
MONGODB_URI=mongodb://localhost:27017/announcements_service
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

Base path: `/api/announcements`

- `POST /api/announcements`  
  Create an announcement.

- `GET /api/announcements`  
  List announcements with pagination and optional filters.
  Query params:
  - `page` (default `1`)
  - `limit` (default `10`, max `100`)
  - `audience` (`ALL` | `STUDENTS` | `PARENTS`)
  - `priority` (`HIGH` | `MEDIUM` | `LOW`)
  - `status` (`PUBLISHED` | `SCHEDULED`)

- `PATCH /api/announcements/:id/status`  
  Update status (`PUBLISHED` | `SCHEDULED`).

## Model

- `title`
- `description`
- `priority` (`HIGH` | `MEDIUM` | `LOW`)
- `audience` (`ALL` | `STUDENTS` | `PARENTS`)
- `status` (`PUBLISHED` | `SCHEDULED`)
- `createdAt`, `updatedAt`
