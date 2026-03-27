#!/bin/bash

BASE_URL="http://localhost:4005"   # ⚠️ PORT check kar lena .env se
JSON="Content-Type: application/json"

echo "==============================="
echo "PAYMENTS SERVICE FULL TEST START"
echo "==============================="

echo
echo "1️⃣ Health Check"
curl -s $BASE_URL/health
echo

# Use same test student id across runs
STUDENT_ID="TEST_STUDENT_001"

echo
echo "2️⃣ Create Payment"
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/api/payments \
  -H "$JSON" \
  -d "{
    \"studentId\": \"$STUDENT_ID\",
    \"amount\": 1500,
    \"paymentMode\": \"CASH\",
    \"transactionId\": \"TXN_$(date +%s)\"
  }")

echo "$CREATE_RESPONSE"

PAYMENT_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d':' -f2 | tr -d '"')

if [ -z "$PAYMENT_ID" ]; then
  echo "Payment creation failed, trying to fetch existing payment ID..."

  LIST_RESPONSE=$(curl -s "$BASE_URL/api/payments?studentId=$STUDENT_ID")
  echo "$LIST_RESPONSE"

  PAYMENT_ID=$(echo $LIST_RESPONSE | grep -o '"_id":"[^"]*' | head -n 1 | cut -d':' -f2 | tr -d '"')
fi

echo
echo "Using PAYMENT_ID = $PAYMENT_ID"

sleep 1

echo
echo "3️⃣ List All Payments"
curl -s "$BASE_URL/api/payments"
echo

sleep 1

echo
echo "4️⃣ List Payments by Student ID"
curl -s "$BASE_URL/api/payments/student/$STUDENT_ID"
echo

sleep 1

echo
echo "5️⃣ Negative Test → Missing Required Fields"
curl -s -X POST $BASE_URL/api/payments \
  -H "$JSON" \
  -d "{
    \"studentId\": \"$STUDENT_ID\"
  }"
echo

sleep 1

echo
echo "6️⃣ Negative Test → Invalid Student ID"
curl -s "$BASE_URL/api/payments/student/123"
echo

echo
echo "==============================="
echo "PAYMENTS SERVICE TEST COMPLETED"
echo "==============================="
