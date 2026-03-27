# Admin → Teacher → Student Workflow

## Global rules
- **Identity**: `const user = JSON.parse(localStorage.getItem('user'));` then `teacherId/studentId = user.userId` (never `id/_id`).
- **Headers** (all protected APIs):
  - `Authorization: Bearer <token>`
  - `x-school-id: <schoolId>` where `schoolId = user.allowedSchoolIds[0]` (stored in `localStorage.schoolId`).
- **Storage after login**:
  - `localStorage.token`, `localStorage.user` (with `userId`), `localStorage.schoolId`.
- **On API failure**: log `{ status, payload, teacherId/studentId, className }`, show friendly error, never crash.

## Admin flow (setup)
1) **Create Teacher** (auth user, role teacher). Teacher domain identity == auth user `_id`.
2) **Create Class**: `name=9`, `section=A` → effective `className="9-A"`.
3) **Assign Teacher to Class**: class record `classTeacherId = teacher.userId`.
4) **Create Students** linked by `student.className = "9-A"`.
5) Ensure at least one **Teacher Timetable** entry exists.

## Teacher dashboard (runtime)
- **Assigned classes**:
  - `GET /api/classes/assigned?teacherId=<teacherId>`.
- **Dashboard summary** uses:
  - assigned classes (above)
  - `GET /api/teacher/timetable/<teacherId>`
  - `GET /api/teacher/attendance/class/<className>`
- **Attendance**:
  1) `GET /api/classes/assigned?teacherId=<teacherId>`
  2) `GET /api/students?className=<className>`
  3) `POST /api/teacher/attendance` payload:
     ```json
     {"items":[{"teacherId":"...","className":"9-A","studentId":"...","date":"YYYY-MM-DD","status":"PRESENT|ABSENT|LATE"}]}
     ```
- **Marks Entry**:
  1) classes assigned
  2) students by class
  3) `POST /api/results/bulk` payload:
     ```json
     {"items":[{"studentId":"...","examName":"...","subject":"...","marks":0,"totalMarks":100,"status":"PASS|FAIL"}]}
     ```
     Status rule: `marks >= totalMarks/2 => PASS` else `FAIL`.
- **Diary (Homework)**:
  - `GET /api/teacher/diary?teacherId=<teacherId>`
  - `POST /api/teacher/diary`:
    ```json
    {"teacherId":"...","className":"9-A","subject":"...","homework":"...","remarks":"...","date":"YYYY-MM-DD"}
    ```
- **Timetable**:
  - `GET /api/teacher/timetable/<teacherId>`.

## Student dashboard (runtime)
- **Profile**: `GET /api/students/<studentId>`.
- **Attendance**: `GET /api/teacher/attendance?studentId=<studentId>`.
- **Homework**: `GET /api/teacher/diary?className=9-A` (className from student profile).
- **Timetable**: `GET /api/teacher/timetable/class/9-A`.
- **Results**: `GET /api/results/student/<studentId>`.
- **Fees**: `GET /api/fees/student/<studentId>`.
