#!/bin/bash

BASE_URL="http://localhost:4008"
JSON="Content-Type: application/json"

echo "==================================="
echo "REQUESTS SERVICE FULL TEST START"
echo "==================================="

echo
echo "1️⃣ Health Check"
curl -s $BASE_URL/health
echo

USER_ID="TEST_USER_001"

echo
echo "2️⃣ Create Request (LEAVE)"
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/api/requests \
  -H "$JSON" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"type\": \"LEAVE\",
    \"reason\": \"Family function\"
  }")

echo "$CREATE_RESPONSE"

REQUEST_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d':' -f2 | tr -d '"')

if [ -z "$REQUEST_ID" ]; then
  echo "Request creation failed, fetching existing request ID..."

  LIST_RESPONSE=$(curl -s "$BASE_URL/api/requests?userId=$USER_ID")
  echo "$LIST_RESPONSE"

  REQUEST_ID=$(echo $LIST_RESPONSE | grep -o '"_id":"[^"]*' | head -n 1 | cut -d':' -f2 | tr -d '"')
fi

echo
echo "Using REQUEST_ID = $REQUEST_ID"

sleep 1

echo
echo "3️⃣ Get All Requests"
curl -s "$BASE_URL/api/requests"
echo

sleep 1

echo
echo "4️⃣ Filter by User ID"
curl -s "$BASE_URL/api/requests?userId=$USER_ID"
echo

sleep 1

echo
echo "5️⃣ Approve Request"
curl -s -X PATCH "$BASE_URL/api/requests/$REQUEST_ID/approve"
echo

sleep 1

echo
echo "6️⃣ Reject Already Approved Request (should fail)"
curl -s -X PATCH "$BASE_URL/api/requests/$REQUEST_ID/reject"
echo

sleep 1

echo
echo "7️⃣ Negative Test → Missing Fields"
curl -s -X POST $BASE_URL/api/requests \
  -H "$JSON" \
  -d "{
    \"userId\": \"$USER_ID\"
  }"
echo

sleep 1

echo
echo "8️⃣ Negative Test → Invalid Request ID"
curl -s -X PATCH "$BASE_URL/api/requests/123/approve"
echo

echo
echo "==================================="
echo "REQUESTS SERVICE TEST COMPLETED"
echo "==================================="
