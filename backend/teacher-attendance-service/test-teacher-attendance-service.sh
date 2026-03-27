#!/bin/bash

BASE_URL="http://localhost:4013"   # ⚠️ .env ka PORT confirm kar lena
API="$BASE_URL/api/teacher/attendance"

echo "========================================="
echo "TEACHER ATTENDANCE SERVICE FULL TEST START"
echo "========================================="

echo ""
echo "1️⃣ Health Check"
curl -s $BASE_URL/health
echo ""
echo ""

echo "2️⃣ Bulk Mark Attendance"

CREATE_RESPONSE=$(curl -s -X POST $API \
-H "Content-Type: application/json" \
-d '{
  "items": [
    {
      "teacherId": "TCHR_001",
      "className": "10-A",
      "studentId": "STD_001",
      "date": "2026-02-19",
      "status": "PRESENT"
    },
    {
      "teacherId": "TCHR_001",
      "className": "10-A",
      "studentId": "STD_002",
      "date": "2026-02-19",
      "status": "ABSENT"
    }
  ]
}')

echo "$CREATE_RESPONSE"
echo ""
echo ""

echo "3️⃣ Fetch Attendance (All)"
curl -s "$API?className=10-A&date=2026-02-19"
echo ""
echo ""

echo "4️⃣ Fetch Attendance By Class"
curl -s "$API/class/10-A?date=2026-02-19"
echo ""
echo ""

echo "5️⃣ Negative Test → Invalid Status"
curl -s -X POST $API \
-H "Content-Type: application/json" \
-d '{
  "items": [
    {
      "teacherId": "TCHR_001",
      "className": "10-A",
      "studentId": "STD_003",
      "date": "2026-02-19",
      "status": "HOLIDAY"
    }
  ]
}'
echo ""
echo ""

echo "6️⃣ Re-submit Same Data (Upsert Check)"
curl -s -X POST $API \
-H "Content-Type: application/json" \
-d '{
  "items": [
    {
      "teacherId": "TCHR_001",
      "className": "10-A",
      "studentId": "STD_001",
      "date": "2026-02-19",
      "status": "LATE"
    }
  ]
}'
echo ""
echo ""

echo "========================================="
echo "TEACHER ATTENDANCE SERVICE TEST COMPLETED"
echo "========================================="
