# teacher-timetable-service

Production-ready **Teacher Timetable Service** microservice built with:
- Node.js
- Express.js
- MongoDB + Mongoose
- REST API

This service manages weekly teacher timetables and class/subject assignments.
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
PORT=4012
MONGODB_URI=mongodb://localhost:27017/teacher_timetable_service
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

Base path: `/api/teacher/timetable`

- `POST   /api/teacher/timetable`
- `GET    /api/teacher/timetable/:teacherId`
- `PATCH  /api/teacher/timetable/:id`
- `DELETE /api/teacher/timetable/:id`

## Model

- `teacherId`
- `className`
- `subject`
- `day` (`MONDAY` | `TUESDAY` | `WEDNESDAY` | `THURSDAY` | `FRIDAY`)
- `startTime` (string)
- `endTime` (string)
- `roomNumber`
- `createdAt`, `updatedAt`
