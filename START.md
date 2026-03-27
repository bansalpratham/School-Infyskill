# START — Run School Hub Locally (No Docker)

This repository is a microservices-based School Management Platform refactor.

Local development runs everything directly on your machine using **Node.js + pnpm**, with **MongoDB** running locally.

## 1) Prerequisites

- Node.js **>= 20**
- pnpm **>= 9**
- MongoDB running locally

Verify:

```bash
node -v
pnpm -v
mongod --version
```

## 2) Project overview

- **Dashboards (Vite + React)**
  - `admin-dashboard/`
  - `teacher-dashboard/`
  - `student-dashboard/`

- **Backend (microservices)**
  - `backend/api-gateway-ts/` (TypeScript API Gateway, port `4100`)
  - `backend/auth-service/` (JS for now, port `5001`)
  - `backend/student-service/` (JS, port `5002`)
  - `backend/teacher-service/` (JS, port `5003`)
  - `backend/fees-service/` (JS, port `5004`)
  - `backend/exam-service/` (JS, port `5006`)

- **Shared packages (TypeScript, pnpm workspaces)**
  - `packages/shared-types`
  - `packages/shared-utils`
  - `packages/shared-middleware`

## 3) Install dependencies

From repo root:

```bash
pnpm install
```

## 4) Start MongoDB

You must have MongoDB running locally at:

- `mongodb://localhost:27017/school_hub`

### Option A: System service (Ubuntu/Debian)

```bash
sudo systemctl start mongod
sudo systemctl status mongod
```

### Option B: Run mongod manually

```bash
mongod --dbpath /var/lib/mongodb
```

## 5) Environment variables (local)

Backend services read environment variables.

Minimum required variables:

- `MONGODB_URI=mongodb://localhost:27017/school_hub`
- `JWT_SECRET=change_me_super_secret`
- `CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173`

Recommended:

- Copy `./.env.example` to `./.env`

The backend services are configured to prefer the repo root `./.env`.

## 6) Run backend services (no Docker)

### Quick start (recommended)

This will start:

- API Gateway (TS)
- Auth
- Student
- Teacher
- Fees
- Exam
- Admin dashboard

From repo root:

```bash
pnpm dev
```

### Start services individually

From repo root:

```bash
pnpm dev:auth
pnpm dev:student
pnpm dev:teacher
pnpm dev:fees
pnpm dev:exam
pnpm dev:gateway
```

## 7) Run dashboards

Admin dashboard (primary dev target):

```bash
pnpm dev:admin
```

Default URL:

- `http://localhost:5173`

Notes:

- In local development, dashboards call the backend using relative URLs like `/api/...` and Vite proxies them to the API Gateway.
- For deployments, set `VITE_API_URL` (example: `https://your-domain.com`) at build time for each Vite dashboard.

Teacher dashboard:

```bash
pnpm dev:teacher-dashboard
```

Default URL:

- `http://localhost:5174`

Student dashboard:

```bash
pnpm dev:student-dashboard
```

Default URL:

- `http://localhost:5175`

## 8) API Gateway URLs

- Health check:
  - `GET http://localhost:4100/health`

Routes:
- `/api/auth/*` is public (no `x-school-id` required)
- All protected routes require:
  - `Authorization: Bearer <token>`
  - `x-school-id: <schoolId>`

## 9) Multi-tenancy rules (Hybrid)

- JWT contains:
  - `userId`
  - `role`
  - `allowedSchoolIds` (array)

- Every protected request must include header:
  - `x-school-id`

- API Gateway enforces:
  - `x-school-id` must be included in `user.allowedSchoolIds`

Middleware chain for protected routes:

- `requireAuth` → `requireSchoolId` → `enforceAllowedSchoolId`

Local dev note:

- If you want to test features quickly before full multi-tenant JWT rollout, set `TENANCY_DISABLED=true` in `backend/.env` and restart the gateway.
  - In the current setup, you can also set it in the repo root `./.env`.

## 10) Test login/register (example)

> Note: Current `auth-service` is still the existing JS service. It may not yet issue JWTs with `allowedSchoolIds` until the auth-service TS migration is complete.

### Register

```bash
curl -X POST http://localhost:4100/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Admin","email":"admin@test.com","password":"Admin@123","role":"admin"}'
```

### Login

```bash
curl -X POST http://localhost:4100/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@test.com","password":"Admin@123"}'
```

### Call a protected route (example)

```bash
curl http://localhost:4100/api/students \
  -H 'Authorization: Bearer <PASTE_TOKEN_HERE>' \
  -H 'x-school-id: <SCHOOL_ID_HERE>'
```

## 11) Admin creates Teacher/Student logins

When you create a **Teacher** or **Student** from the Admin Dashboard, the UI will:

- create an auth user first via `POST /api/auth/register` (with a temporary password)
- then create the domain record via `POST /api/teachers` / `POST /api/students` with `authUserId` set to the auth user id

This means the created Teacher/Student can immediately log in to their dashboards using:

- the **email** you entered
- the **temporary password** you entered

Dashboards automatically send `x-school-id` based on the logged-in user's `allowedSchoolIds[0]`.

## 12) Troubleshooting

### A) MongoDB connection errors

- Ensure MongoDB is running:
  - `mongodb://localhost:27017/school_hub`

### B) CORS errors

- Ensure frontend is running on:
  - Admin: `http://localhost:5173`
  - Teacher: `http://localhost:5174`
  - Student: `http://localhost:5175`
- Ensure `CORS_ORIGIN` includes:
  - `http://localhost:5173,http://127.0.0.1:5173`

### C) API Gateway TS fails to start with shared package "dist" errors

If you see errors like:

`Cannot find module ... @school-hub/shared-utils/dist/index.js`

Run:

```bash
pnpm build:shared
```

Then restart the gateway.

### D) Auth-service crash: `Missing parameter name at index ...: *` or `/*`

- This occurs with Express 5 if `app.options('*', ...)` is used.
- The repo has been updated to use a safe RegExp route for preflight.

### E) Ports already in use

Stop running node processes or change the port env vars in root scripts.

---

If you want, the next step is migrating `auth-service` to TypeScript so JWT contains `allowedSchoolIds`, enabling end-to-end tenant enforcement.
