# teacher-notifications-service

Production-ready **Teacher Notifications Service** microservice built with:
- Node.js
- Express.js
- MongoDB + Mongoose
- REST API

This service stores teacher notifications and supports marking notifications as read.
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
PORT=4017
MONGODB_URI=mongodb://localhost:27017/teacher_notifications_service
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

Base path: `/api/teacher/notifications`

- `POST  /api/teacher/notifications`
- `GET   /api/teacher/notifications/:teacherId`
- `PATCH /api/teacher/notifications/:id/read`

## Model

- `teacherId`
- `title`
- `message`
- `type`
- `isRead`
- `createdAt`, `updatedAt`
