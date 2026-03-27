#!/bin/bash

BASE_URL="http://localhost:4019"
TMP_DIR="/tmp/teacher_achievements_test"

echo "=============================================="
echo "TEACHER ACHIEVEMENTS SERVICE FULL TEST START"
echo "=============================================="

mkdir -p $TMP_DIR

echo
echo "1️⃣ Health Check"
curl -s $BASE_URL/health
echo

echo
echo "2️⃣ Create Achievement"
CREATE_RES=$(curl -s -X POST $BASE_URL/api/teacher/achievements \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STD_001",
    "className": "10-A",
    "category": "Sports",
    "title": "Inter School Football",
    "description": "Won first prize in inter-school football tournament",
    "level": "DISTRICT",
    "date": "2026-02-20"
  }')

echo "$CREATE_RES"

ACH_ID=$(echo "$CREATE_RES" | jq -r '.data._id')
echo
echo "Using ACHIEVEMENT_ID = $ACH_ID"

echo
echo "3️⃣ Get All Achievements"
curl -s "$BASE_URL/api/teacher/achievements?page=1&limit=10"
echo

echo
echo "4️⃣ Filter By Class Name"
curl -s "$BASE_URL/api/teacher/achievements?className=10-A"
echo

echo
echo "5️⃣ Filter By Level"
curl -s "$BASE_URL/api/teacher/achievements?level=DISTRICT"
echo

echo
echo "6️⃣ Get Achievements By Student ID"
curl -s "$BASE_URL/api/teacher/achievements/student/STD_001"
echo

echo
echo "7️⃣ Negative Test → Invalid Level"
curl -s -X POST $BASE_URL/api/teacher/achievements \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STD_002",
    "className": "10-B",
    "category": "Academics",
    "title": "Math Olympiad",
    "description": "Participated in Olympiad",
    "level": "WORLD",
    "date": "2026-02-20"
  }'
echo

echo
echo "8️⃣ Negative Test → Invalid Date Format"
curl -s -X POST $BASE_URL/api/teacher/achievements \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STD_003",
    "className": "9-A",
    "category": "Art",
    "title": "Painting Competition",
    "description": "Won painting competition",
    "level": "SCHOOL",
    "date": "20-02-2026"
  }'
echo

echo
echo "=============================================="
echo "TEACHER ACHIEVEMENTS SERVICE TEST COMPLETED"
echo "=============================================="
