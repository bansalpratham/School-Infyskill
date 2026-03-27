# teacher-service

Production-ready **Teacher Service** microservice built with:
- Node.js
- Express.js
- MongoDB + Mongoose
- REST API

This service is **JWT-ready** but does **not** implement login/authentication.
Assume an API Gateway or separate `auth-service` validates JWT and forwards requests.

## Folder Structure

```
teacher-service/
 ├── src/
 │   ├── controllers/
 │   │   └── teacher.controller.js
 │   ├── routes/
 │   │   └── teacher.routes.js
 │   ├── services/
 │   │   └── teacher.service.js
 │   ├── models/
 │   │   └── teacher.model.js
 │   ├── dto/
 │   │   ├── create-teacher.dto.js
 │   │   └── update-teacher.dto.js
 │   ├── middlewares/
 │   │   └── error.middleware.js
 │   ├── config/
 │   │   └── db.js
 │   ├── utils/
 │   │   └── apiResponse.js
 │   └── app.js
 ├── server.js
 ├── package.json
 ├── .env
 ├── .gitignore
 └── README.md
```

## Setup

### 1) Install dependencies
```bash
pnpm i
```

### 2) Configure environment variables
Create a `.env` file in the project root:
```bash
NODE_ENV=development
PORT=4003
MONGODB_URI=mongodb://localhost:27017/teacher_service
```

### 3) Run the service
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

## API Endpoints

Base path: `/api/teachers`

- `POST   /api/teachers`  
  Create teacher

- `GET    /api/teachers`  
  List teachers (pagination + search)
  Query params:
  - `page` (default `1`)
  - `limit` (default `10`, max `100`)
  - `search` (matches `firstName`, `lastName`, `email`, `subjects`)

- `GET    /api/teachers/:id`  
  Get teacher by id

- `PUT    /api/teachers/:id`  
  Update teacher

- `PATCH  /api/teachers/:id/status`  
  Update `status` (`ACTIVE` / `INACTIVE`)

- `DELETE /api/teachers/:id`  
  Soft delete (sets `status = INACTIVE`)

## Teacher Model

Fields:
- `firstName` (required)
- `lastName` (required)
- `email` (unique, required)
- `phone`
- `subjects` (array of strings)
- `status` (`ACTIVE` | `INACTIVE`)
- `createdAt`, `updatedAt` (managed by Mongoose timestamps)

## Notes

- Centralized error handling is implemented in `src/middlewares/error.middleware.js`.
- DTO validation uses Joi in `src/dto/*`.
- No business logic exists inside routes (routes only map to controllers).
