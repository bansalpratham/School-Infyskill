# exam-service

Production-ready **Exam Service** microservice built with:
- Node.js
- Express.js
- MongoDB + Mongoose
- REST API

This service stores **exam results** for admin/teacher workflows.
No auth logic is included (assume gateway already validates JWT).

## Setup

### 1) Install dependencies
```bash
pnpm i
```

### 2) Configure environment variables
Create a `.env` file in the project root (sample provided):
```bash
NODE_ENV=development
PORT=4006
MONGODB_URI=mongodb://localhost:27017/exam_service
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

Base path: `/api/results`

- `POST /api/results`  
  Upload marks (create a result record).

- `GET /api/results`  
  List results with pagination + filters.
  Query params:
  - `page` (default `1`)
  - `limit` (default `10`, max `100`)
  - `studentId` (exact match)
  - `examName` (exact match)
  - `subject` (exact match)
  - `status` (`PASS` | `FAIL`)

- `GET /api/results/student/:studentId`  
  Get results for a student.

## Result Model

- `studentId`
- `examName`
- `subject`
- `marks` (number)
- `grade` (string)
- `status` (`PASS` | `FAIL`)
- `createdAt`, `updatedAt`

## Notes

- Status is validated (`PASS`/`FAIL`).
- This service is suitable for admin and teacher usage via API Gateway.
