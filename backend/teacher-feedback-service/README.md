# teacher-feedback-service

Production-ready **Teacher Feedback Service** microservice built with:
- Node.js
- Express.js
- MongoDB + Mongoose
- REST API

This service supports teacher-to-parent feedback and maintains conversation-like feedback records.
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
PORT=4016
MONGODB_URI=mongodb://localhost:27017/teacher_feedback_service
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

Base path: `/api/teacher/feedback`

- `POST /api/teacher/feedback`  
  Create a feedback record.

- `GET /api/teacher/feedback`  
  List feedback with pagination + optional filters.
  Query params:
  - `page` (default `1`)
  - `limit` (default `10`, max `100`)
  - `teacherId` (exact match)
  - `studentId` (exact match)
  - `status` (`OPEN` | `CLOSED`)
  - `category` (exact match)

- `GET /api/teacher/feedback/student/:studentId`  
  Fetch feedback for a student (latest first).

## Model

- `teacherId`
- `studentId`
- `parentName`
- `category`
- `message`
- `reply`
- `status` (`OPEN` | `CLOSED`)
- `createdAt`, `updatedAt`
