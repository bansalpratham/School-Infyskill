#!/bin/bash

BASE_URL="http://localhost:4015"   # agar port alag ho to change kar lena

echo "========================================="
echo "TEACHER DIARY SERVICE FULL TEST START"
echo "========================================="

echo -e "\n1️⃣ Health Check"
curl -s "$BASE_URL/health"
echo

echo -e "\n2️⃣ Create Diary Entry"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/teacher/diary" \
  -H "Content-Type: application/json" \
  -d '{
    "teacherId": "TCHR_001",
    "className": "10-A",
    "subject": "Mathematics",
    "date": "2026-02-22",
    "homework": "Solve chapter 5 exercises",
    "remarks": "Bring notebook signed by parents"
  }')

echo "$CREATE_RESPONSE"

DIARY_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data._id')

echo -e "\nUsing DIARY_ID = $DIARY_ID"

echo -e "\n3️⃣ Get All Diary Entries"
curl -s "$BASE_URL/api/teacher/diary"
echo

echo -e "\n4️⃣ Get Diary By Class Name"
curl -s "$BASE_URL/api/teacher/diary/class/10-A"
echo

echo -e "\n5️⃣ Filter By Date"
curl -s "$BASE_URL/api/teacher/diary?date=2026-02-22"
echo

echo -e "\n6️⃣ Negative Test → Missing Homework & Remarks"
curl -s -X POST "$BASE_URL/api/teacher/diary" \
  -H "Content-Type: application/json" \
  -d '{
    "teacherId": "TCHR_001",
    "className": "10-A",
    "subject": "Science",
    "date": "2026-02-22"
  }'
echo

echo -e "\n7️⃣ Negative Test → Invalid Date Format"
curl -s -X POST "$BASE_URL/api/teacher/diary" \
  -H "Content-Type: application/json" \
  -d '{
    "teacherId": "TCHR_001",
    "className": "10-A",
    "subject": "Science",
    "date": "22-02-2026",
    "homework": "Read chapter"
  }'
echo

echo -e "\n========================================="
echo "TEACHER DIARY SERVICE TEST COMPLETED"
echo "========================================="
