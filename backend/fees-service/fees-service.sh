#!/bin/bash

BASE_URL="http://localhost:4004"
JSON="Content-Type: application/json"

echo "============================="
echo "FEES SERVICE FULL TEST START"
echo "============================="

echo
echo "1️⃣ Health Check"
curl -s $BASE_URL/health
echo

# Use an existing studentId (from student-service)
STUDENT_ID="TEST_STUDENT_001"

echo
echo "2️⃣ Create Fee Record"
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/api/fees \
  -H "$JSON" \
  -d "{
    \"studentId\": \"$STUDENT_ID\",
    \"totalAmount\": 5000,
    \"paidAmount\": 2000
  }")

echo "$CREATE_RESPONSE"

FEE_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d':' -f2 | tr -d '"')

if [ -z "$FEE_ID" ]; then
  echo "Fee already exists or creation failed, fetching existing fee ID..."

  LIST_RESPONSE=$(curl -s "$BASE_URL/api/fees?studentId=$STUDENT_ID")
  FEE_ID=$(echo $LIST_RESPONSE | grep -o '"_id":"[^"]*' | head -n 1 | cut -d':' -f2 | tr -d '"')
fi

echo
echo "Using FEE_ID = $FEE_ID"

sleep 1

echo
echo "3️⃣ Get Fees by Student ID"
curl -s $BASE_URL/api/fees/student/$STUDENT_ID
echo

sleep 1

echo
echo "4️⃣ Pay Fee (Partial Payment)"
curl -s -X PATCH $BASE_URL/api/fees/$FEE_ID/pay \
  -H "$JSON" \
  -d '{ "amount": 1000 }'
echo

sleep 1

echo
echo "5️⃣ Pay Fee (Final Payment)"
curl -s -X PATCH $BASE_URL/api/fees/$FEE_ID/pay \
  -H "$JSON" \
  -d '{ "amount": 2000 }'
echo

sleep 1

echo
echo "6️⃣ List All Fees"
curl -s $BASE_URL/api/fees
echo

sleep 1

echo
echo "7️⃣ Dashboard Summary"
curl -s $BASE_URL/api/fees/summary
echo

sleep 1

echo
echo "8️⃣ Negative Test → Overpayment"
curl -s -X PATCH $BASE_URL/api/fees/$FEE_ID/pay \
  -H "$JSON" \
  -d '{ "amount": 500 }'
echo

sleep 1

echo
echo "9️⃣ Negative Test → Invalid Fee ID"
curl -s $BASE_URL/api/fees/123/pay
echo

echo
echo "============================="
echo "FEES SERVICE TEST COMPLETED"
echo "============================="
