# student-service

Production-ready **Student Service** microservice built with:
- Node.js
- Express.js
- MongoDB + Mongoose
- REST API

This service is **JWT-ready** but does **not** implement login/authentication.
Assume an API Gateway or separate `auth-service` validates JWT and forwards requests.

## Folder Structure

```
student-service/
 ├── src/
 │   ├── controllers/
 │   │   └── student.controller.js
 │   ├── routes/
 │   │   └── student.routes.js
 │   ├── services/
 │   │   └── student.service.js
 │   ├── models/
 │   │   └── student.model.js
 │   ├── dto/
 │   │   ├── create-student.dto.js
 │   │   └── update-student.dto.js
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
 └── README.md
```

## Setup

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment variables
Create a `.env` file in the project root (example provided in `.env`):
```bash
NODE_ENV=development
PORT=4002
MONGODB_URI=mongodb://localhost:27017/student_service
```

### 3) Run the service
Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

Health check:
- `GET /health`

## API Endpoints

Base path: `/api/students`

- `POST   /api/students`  
  Create student

- `GET    /api/students`  
  List students (pagination + search)
  Query params:
  - `page` (default `1`)
  - `limit` (default `10`, max `100`)
  - `search` (matches `firstName`, `lastName`, `className`)
  - `className` (exact match)

- `GET    /api/students/:id`  
  Get student by id

- `PUT    /api/students/:id`  
  Update student

- `PATCH  /api/students/:id/status`  
  Update `status` (`ACTIVE` / `INACTIVE`)

- `DELETE /api/students/:id`  
  Soft delete (sets `status = INACTIVE`)

## Student Model

Fields:
- `firstName` (required)
- `lastName` (required)
- `email` (unique, required)
- `phone`
- `className`
- `rollNumber`
- `admissionId` (unique, optional)
- `status` (`ACTIVE` | `INACTIVE`)
- `createdAt`, `updatedAt` (managed by Mongoose timestamps)

## Notes

- Centralized error handling is implemented in `src/middlewares/error.middleware.js`.
- DTO validation uses Joi in `src/dto/*`.
- No business logic exists inside routes (routes only map to controllers).
