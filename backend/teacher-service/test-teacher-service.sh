#!/bin/bash

BASE_URL="http://localhost:4003"
JSON="Content-Type: application/json"

echo "==============================="
echo "TEACHER SERVICE FULL TEST START"
echo "==============================="

echo
echo "1️⃣ Health Check"
curl -s $BASE_URL/health
echo

echo
echo "2️⃣ Create Teacher (may already exist)"
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/api/teachers \
  -H "$JSON" \
  -d '{
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah.johnson@school.com",
    "phone": "9876543210",
    "subjects": ["Math", "Physics"]
  }')

echo "$CREATE_RESPONSE"

TEACHER_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d':' -f2 | tr -d '"')

if [ -z "$TEACHER_ID" ]; then
  echo "Teacher already exists, fetching existing ID..."

  LIST_RESPONSE=$(curl -s $BASE_URL/api/teachers)
  TEACHER_ID=$(echo $LIST_RESPONSE | grep -o '"_id":"[^"]*' | head -n 1 | cut -d':' -f2 | tr -d '"')
fi

echo
echo "Using TEACHER_ID = $TEACHER_ID"

sleep 1

echo
echo "3️⃣ Get Teacher By ID"
curl -s $BASE_URL/api/teachers/$TEACHER_ID
echo

sleep 1

echo
echo "4️⃣ Update Teacher"
curl -s -X PUT $BASE_URL/api/teachers/$TEACHER_ID \
  -H "$JSON" \
  -d '{
    "phone": "9999999999",
    "subjects": ["Math"]
  }'
echo

sleep 1

echo
echo "5️⃣ Update Status → INACTIVE"
curl -s -X PATCH $BASE_URL/api/teachers/$TEACHER_ID/status \
  -H "$JSON" \
  -d '{ "status": "INACTIVE" }'
echo

sleep 1

echo
echo "6️⃣ Soft Delete Teacher"
curl -s -X DELETE $BASE_URL/api/teachers/$TEACHER_ID
echo

sleep 1

echo
echo "7️⃣ Negative Test → Invalid ID"
curl -s $BASE_URL/api/teachers/123
echo

sleep 1

echo
echo "8️⃣ Negative Test → Invalid Status"
curl -s -X PATCH $BASE_URL/api/teachers/$TEACHER_ID/status \
  -H "$JSON" \
  -d '{ "status": "DELETED" }'
echo

echo
echo "==============================="
echo "TEACHER SERVICE TEST COMPLETED"
echo "==============================="
