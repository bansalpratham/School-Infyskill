#!/bin/bash

BASE_URL="http://localhost:4012"
API="$BASE_URL/api/teacher/timetable"

echo "========================================="
echo "TEACHER TIMETABLE SERVICE FULL TEST START"
echo "========================================="

echo ""
echo "1️⃣ Health Check"
curl -s $BASE_URL/health
echo ""
echo ""

echo "2️⃣ Create Timetable Entry"

CREATE_RESPONSE=$(curl -s -X POST $API \
-H "Content-Type: application/json" \
-d '{
  "teacherId": "TCHR_001",
  "className": "10-A",
  "subject": "Mathematics",
  "day": "MONDAY",
  "startTime": "09:00",
  "endTime": "10:00",
  "roomNumber": "201"
}')

echo $CREATE_RESPONSE
echo ""

TIMETABLE_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)

echo "Using TIMETABLE_ID = $TIMETABLE_ID"
echo ""

echo "3️⃣ Get Timetable By Teacher ID"
curl -s $API/TCHR_001
echo ""
echo ""

echo "4️⃣ Update Timetable Entry"

curl -s -X PATCH $API/$TIMETABLE_ID \
-H "Content-Type: application/json" \
-d '{
  "roomNumber": "305",
  "endTime": "10:30"
}'
echo ""
echo ""

echo "5️⃣ Negative Test → Invalid Day"
curl -s -X POST $API \
-H "Content-Type: application/json" \
-d '{
  "teacherId": "TCHR_001",
  "className": "10-A",
  "subject": "Math",
  "day": "SUNDAY",
  "startTime": "09:00",
  "endTime": "10:00",
  "roomNumber": "201"
}'
echo ""
echo ""

echo "6️⃣ Delete Timetable Entry"
curl -s -X DELETE $API/$TIMETABLE_ID
echo ""
echo ""

echo "========================================="
echo "TEACHER TIMETABLE SERVICE TEST COMPLETED"
echo "========================================="
