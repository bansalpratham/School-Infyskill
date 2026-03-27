# teacher-diary-service

Production-ready **Teacher Diary Service** microservice built with:
- Node.js
- Express.js
- MongoDB + Mongoose
- REST API

This service supports teachers adding daily homework/remarks and fetching diary entries by class.
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
PORT=4015
MONGODB_URI=mongodb://localhost:27017/teacher_diary_service
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

Base path: `/api/teacher/diary`

- `POST /api/teacher/diary`  
  Create a diary entry.

- `GET /api/teacher/diary`  
  List diary entries with pagination + filters.
  Query params:
  - `page` (default `1`)
  - `limit` (default `10`, max `100`)
  - `teacherId` (exact match)
  - `className` (exact match)
  - `subject` (exact match)
  - `date` (YYYY-MM-DD)

- `GET /api/teacher/diary/class/:className`  
  Get diary entries for a class (optional filters: `date`, `subject`).

## Model

- `teacherId`
- `className`
- `subject`
- `date` (YYYY-MM-DD)
- `homework`
- `remarks`
- `createdAt`, `updatedAt`
