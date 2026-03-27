# teacher-attendance-service

Production-ready **Teacher Attendance Service** microservice built with:
- Node.js
- Express.js
- MongoDB + Mongoose
- REST API

This service supports teachers marking student attendance and fetching attendance records.
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
PORT=4013
MONGODB_URI=mongodb://localhost:27017/teacher_attendance_service
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

Base path: `/api/teacher/attendance`

- `POST /api/teacher/attendance`  
  Bulk submit attendance entries.

- `GET /api/teacher/attendance`  
  List attendance with pagination and filters.
  Query params:
  - `page` (default `1`)
  - `limit` (default `10`, max `100`)
  - `teacherId` (exact match)
  - `className` (exact match)
  - `date` (YYYY-MM-DD)
  - `status` (`PRESENT` | `ABSENT` | `LATE`)

- `GET /api/teacher/attendance/class/:className`  
  Fetch attendance records for a class (optional filters: `date`, `status`).

## Model

- `teacherId`
- `className`
- `studentId`
- `date` (YYYY-MM-DD)
- `status` (`PRESENT` | `ABSENT` | `LATE`)
- `createdAt`, `updatedAt`
