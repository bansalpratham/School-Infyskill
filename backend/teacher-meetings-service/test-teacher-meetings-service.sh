#!/bin/bash

BASE_URL="http://localhost:4018"   

echo "=========================================="
echo "TEACHER MEETINGS SERVICE FULL TEST START"
echo "=========================================="

echo -e "\n1️⃣ Health Check"
curl -s "$BASE_URL/health"
echo

echo -e "\n2️⃣ Create Meeting"

CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/teacher/meetings" \
  -H "Content-Type: application/json" \
  -d '{
    "teacherId": "TCHR_001",
    "title": "Parent Teacher Meeting",
    "type": "PTA",
    "date": "2026-02-25",
    "time": "14:00",
    "duration": 60,
    "location": "Room 201",
    "attendees": ["Parent STD_001", "Parent STD_002"]
  }')

echo "$CREATE_RESPONSE"

MEETING_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data._id')
echo -e "\nUsing MEETING_ID = $MEETING_ID"

echo -e "\n3️⃣ Get All Meetings"
curl -s "$BASE_URL/api/teacher/meetings"
echo

echo -e "\n4️⃣ Get Meetings By Teacher ID"
curl -s "$BASE_URL/api/teacher/meetings/TCHR_001"
echo

echo -e "\n5️⃣ Filter By Type"
curl -s "$BASE_URL/api/teacher/meetings?type=PTA"
echo

echo -e "\n6️⃣ Filter Upcoming Meetings"
curl -s "$BASE_URL/api/teacher/meetings?scope=upcoming"
echo

echo -e "\n7️⃣ Negative Test → Invalid Type"
curl -s -X POST "$BASE_URL/api/teacher/meetings" \
  -H "Content-Type: application/json" \
  -d '{
    "teacherId": "TCHR_001",
    "title": "Invalid Meeting",
    "type": "ONLINE",
    "date": "2026-02-25",
    "time": "10:00",
    "duration": 30,
    "location": "Room 101"
  }'
echo

echo -e "\n8️⃣ Negative Test → Invalid Date Format"
curl -s -X POST "$BASE_URL/api/teacher/meetings" \
  -H "Content-Type: application/json" \
  -d '{
    "teacherId": "TCHR_001",
    "title": "Bad Date",
    "type": "STAFF",
    "date": "25-02-2026",
    "time": "10:00",
    "duration": 30,
    "location": "Room 101"
  }'
echo

echo -e "\n=========================================="
echo "TEACHER MEETINGS SERVICE TEST COMPLETED"
echo "=========================================="
