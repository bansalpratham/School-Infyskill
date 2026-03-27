#!/bin/bash

BASE_URL="http://localhost:4006"
JSON="Content-Type: application/json"

echo "==============================="
echo "EXAM SERVICE FULL TEST START"
echo "==============================="

echo
echo "1️⃣ Health Check"
curl -s $BASE_URL/health
echo

STUDENT_ID="TEST_STUDENT_001"

echo
echo "2️⃣ Create Exam Result"
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/api/results \
  -H "$JSON" \
  -d "{
    \"studentId\": \"$STUDENT_ID\",
    \"examName\": \"Mid Term 2026\",
    \"subject\": \"Math\",
    \"marks\": 78,
    \"grade\": \"B\",
    \"status\": \"PASS\"
  }")

echo "$CREATE_RESPONSE"

RESULT_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d':' -f2 | tr -d '"')

if [ -z "$RESULT_ID" ]; then
  echo "Result already exists or creation failed, fetching existing result ID..."

  LIST_RESPONSE=$(curl -s "$BASE_URL/api/results?studentId=$STUDENT_ID")
  echo "$LIST_RESPONSE"

  RESULT_ID=$(echo $LIST_RESPONSE | grep -o '"_id":"[^"]*' | head -n 1 | cut -d':' -f2 | tr -d '"')
fi

echo
echo "Using RESULT_ID = $RESULT_ID"

sleep 1

echo
echo "3️⃣ Get All Results"
curl -s "$BASE_URL/api/results"
echo

sleep 1

echo
echo "4️⃣ Get Results by Student ID"
curl -s "$BASE_URL/api/results/student/$STUDENT_ID"
echo

sleep 1

echo
echo "5️⃣ Filter by Subject"
curl -s "$BASE_URL/api/results?subject=Math"
echo

sleep 1

echo
echo "6️⃣ Negative Test → Missing Required Fields"
curl -s -X POST $BASE_URL/api/results \
  -H "$JSON" \
  -d "{
    \"studentId\": \"$STUDENT_ID\"
  }"
echo

sleep 1

echo
echo "7️⃣ Negative Test → Invalid Status"
curl -s -X POST $BASE_URL/api/results \
  -H "$JSON" \
  -d "{
    \"studentId\": \"$STUDENT_ID\",
    \"examName\": \"Final 2026\",
    \"subject\": \"Science\",
    \"marks\": 40,
    \"grade\": \"D\",
    \"status\": \"FAILED\"
  }"
echo

echo
echo "==============================="
echo "EXAM SERVICE TEST COMPLETED"
echo "==============================="
