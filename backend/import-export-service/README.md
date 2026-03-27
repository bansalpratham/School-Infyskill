# import-export-service

Production-ready **Import/Export Service** microservice built with:
- Node.js
- Express.js
- MongoDB + Mongoose
- `multer` for file uploads
- `xlsx` for Excel parsing/generation

This service supports importing data via Excel files and exporting reports as Excel.
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
PORT=4009
MONGODB_URI=mongodb://localhost:27017/school_import_export
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

Health:
- `GET /health`

## API

### Import
Uploads use `multipart/form-data` with a single file field named `file`.

- `POST /api/import/students`
- `POST /api/import/fees`

### Export
- `GET /api/export/students`

## Excel Format

### Students import columns
Recommended headers (case-insensitive):
- `firstName`
- `lastName`
- `email`
- `phone`
- `className`
- `rollNumber`
- `admissionId`
- `status` (optional: `ACTIVE`/`INACTIVE`)

### Fees import columns
Recommended headers (case-insensitive):
- `studentId`
- `totalAmount`
- `paidAmount` (optional, default 0)

## Notes

- Import endpoints use bulk upsert to avoid duplicates.
- Amount fields are stored as numbers.
