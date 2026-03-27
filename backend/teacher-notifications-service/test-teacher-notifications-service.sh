#!/bin/bash

BASE_URL="http://localhost:4017"  
echo "=============================================="
echo "TEACHER NOTIFICATIONS SERVICE FULL TEST START"
echo "=============================================="

echo -e "\n1️⃣ Health Check"
curl -s "$BASE_URL/health"
echo

echo -e "\n2️⃣ Create Notification"

CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/teacher/notifications" \
  -H "Content-Type: application/json" \
  -d '{
    "teacherId": "TCHR_001",
    "title": "Staff Meeting",
    "message": "Staff meeting at 3 PM in conference hall.",
    "type": "GENERAL"
  }')

echo "$CREATE_RESPONSE"

NOTIFICATION_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data._id')

echo -e "\nUsing NOTIFICATION_ID = $NOTIFICATION_ID"

echo -e "\n3️⃣ Get Notifications By Teacher ID"
curl -s "$BASE_URL/api/teacher/notifications/TCHR_001"
echo

echo -e "\n4️⃣ Filter By isRead=false"
curl -s "$BASE_URL/api/teacher/notifications/TCHR_001?isRead=false"
echo

echo -e "\n5️⃣ Mark Notification As Read"
curl -s -X PATCH "$BASE_URL/api/teacher/notifications/$NOTIFICATION_ID/read"
echo

echo -e "\n6️⃣ Verify isRead=true"
curl -s "$BASE_URL/api/teacher/notifications/TCHR_001?isRead=true"
echo

echo -e "\n7️⃣ Negative Test → Invalid Notification ID"
curl -s -X PATCH "$BASE_URL/api/teacher/notifications/123/read"
echo

echo -e "\n8️⃣ Negative Test → Missing Required Fields"
curl -s -X POST "$BASE_URL/api/teacher/notifications" \
  -H "Content-Type: application/json" \
  -d '{
    "teacherId": "TCHR_001"
  }'
echo

echo -e "\n=============================================="
echo "TEACHER NOTIFICATIONS SERVICE TEST COMPLETED"
echo "=============================================="
