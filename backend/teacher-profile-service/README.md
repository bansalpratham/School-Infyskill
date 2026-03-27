# teacher-profile-service

Production-ready **Teacher Profile Service** microservice built with:
- Node.js
- Express.js
- MongoDB + Mongoose
- REST API

This service stores teacher profile details and supports updating/fetching profiles.
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
PORT=4011
MONGODB_URI=mongodb://localhost:27017/teacher_profile_service
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

Base path: `/api/teacher/profile`

- `GET   /api/teacher/profile/:id`
- `PATCH /api/teacher/profile/:id`

## Model

- `firstName`
- `lastName`
- `email`
- `phone`
- `qualification`
- `experience`
- `subjects` (array)
- `role`
- `status` (`ACTIVE` | `INACTIVE`)
- `createdAt`, `updatedAt`
