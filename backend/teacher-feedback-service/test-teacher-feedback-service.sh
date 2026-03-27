#!/bin/bash

BASE_URL="http://localhost:4016"  
echo "========================================="
echo "TEACHER FEEDBACK SERVICE FULL TEST START"
echo "========================================="

echo -e "\n1️⃣ Health Check"
curl -s "$BASE_URL/health"
echo

echo -e "\n2️⃣ Create Feedback"

CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/teacher/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "teacherId": "TCHR_001",
    "studentId": "STD_001",
    "parentName": "Mr. Sharma",
    "category": "Behavior",
    "message": "Student needs to focus more in class.",
    "status": "OPEN"
  }')

echo "$CREATE_RESPONSE"

FEEDBACK_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data._id')

echo -e "\nUsing FEEDBACK_ID = $FEEDBACK_ID"

echo -e "\n3️⃣ Get All Feedback"
curl -s "$BASE_URL/api/teacher/feedback"
echo

echo -e "\n4️⃣ Get Feedback By Student ID"
curl -s "$BASE_URL/api/teacher/feedback/student/STD_001"
echo

echo -e "\n5️⃣ Filter By Status"
curl -s "$BASE_URL/api/teacher/feedback?status=OPEN"
echo

echo -e "\n6️⃣ Negative Test → Invalid Status"
curl -s -X POST "$BASE_URL/api/teacher/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "teacherId": "TCHR_001",
    "studentId": "STD_002",
    "parentName": "Mrs. Singh",
    "category": "Homework",
    "message": "Homework not completed.",
    "status": "PENDING"
  }'
echo

echo -e "\n7️⃣ Negative Test → Missing Required Fields"
curl -s -X POST "$BASE_URL/api/teacher/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "teacherId": "TCHR_001"
  }'
echo

echo -e "\n========================================="
echo "TEACHER FEEDBACK SERVICE TEST COMPLETED"
echo "========================================="
