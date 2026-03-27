# teacher-meetings-service

Production-ready **Teacher Meetings Service** microservice built with:
- Node.js
- Express.js
- MongoDB + Mongoose
- REST API

This service schedules meetings and helps track upcoming and past meetings.
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
PORT=4018
MONGODB_URI=mongodb://localhost:27017/teacher_meetings_service
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

Base path: `/api/teacher/meetings`

- `POST /api/teacher/meetings`  
  Create a meeting.

- `GET /api/teacher/meetings`  
  List meetings with pagination + filters.
  Query params:
  - `page` (default `1`)
  - `limit` (default `10`, max `100`)
  - `teacherId` (exact match)
  - `type` (`PTA` | `STAFF` | `OTHER`)
  - `date` (YYYY-MM-DD)
  - `scope` (`upcoming` | `past`) optional

- `GET /api/teacher/meetings/:teacherId`  
  List meetings for a teacher (same filters supported via query params).

## Model

- `teacherId`
- `title`
- `type` (`PTA` | `STAFF` | `OTHER`)
- `date` (YYYY-MM-DD)
- `time` (HH:MM)
- `duration` (minutes)
- `location`
- `attendees` (array)
- `createdAt`, `updatedAt`
