# teacher-achievements-service

Production-ready **Teacher Achievements Service** microservice built with:
- Node.js
- Express.js
- MongoDB + Mongoose
- REST API

This service records student achievements entered by teachers and supports filtering by class and category.
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
PORT=4019
MONGODB_URI=mongodb://localhost:27017/teacher_achievements_service
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

Base path: `/api/teacher/achievements`

- `POST /api/teacher/achievements`  
  Create an achievement.

- `GET /api/teacher/achievements`  
  List achievements with pagination + filters.
  Query params:
  - `page` (default `1`)
  - `limit` (default `10`, max `100`)
  - `className` (exact match)
  - `category` (exact match)
  - `level` (`SCHOOL` | `DISTRICT` | `STATE` | `NATIONAL`)
  - `date` (YYYY-MM-DD)

- `GET /api/teacher/achievements/student/:studentId`  
  List achievements for a specific student (same filters supported via query params).

## Model

- `studentId`
- `className`
- `category`
- `title`
- `description`
- `level` (`SCHOOL` | `DISTRICT` | `STATE` | `NATIONAL`)
- `date` (YYYY-MM-DD)
- `createdAt`, `updatedAt`
