#!/bin/bash

BASE_URL="http://localhost:4007"
JSON="Content-Type: application/json"

echo "===================================="
echo "ANNOUNCEMENTS SERVICE FULL TEST START"
echo "===================================="

echo
echo "1️⃣ Health Check"
curl -s $BASE_URL/health
echo

echo
echo "2️⃣ Create Announcement"
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/api/announcements \
  -H "$JSON" \
  -d '{
    "title": "School Reopens",
    "description": "School will reopen on Monday.",
    "priority": "HIGH",
    "audience": "ALL",
    "status": "PUBLISHED"
  }')

echo "$CREATE_RESPONSE"

ANNOUNCEMENT_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d':' -f2 | tr -d '"')

if [ -z "$ANNOUNCEMENT_ID" ]; then
  echo "Creation failed, fetching existing announcement ID..."

  LIST_RESPONSE=$(curl -s "$BASE_URL/api/announcements")
  echo "$LIST_RESPONSE"

  ANNOUNCEMENT_ID=$(echo $LIST_RESPONSE | grep -o '"_id":"[^"]*' | head -n 1 | cut -d':' -f2 | tr -d '"')
fi

echo
echo "Using ANNOUNCEMENT_ID = $ANNOUNCEMENT_ID"

sleep 1

echo
echo "3️⃣ Get All Announcements"
curl -s "$BASE_URL/api/announcements"
echo

sleep 1

echo
echo "4️⃣ Filter by Audience"
curl -s "$BASE_URL/api/announcements?audience=ALL"
echo

sleep 1

echo
echo "5️⃣ Filter by Priority"
curl -s "$BASE_URL/api/announcements?priority=HIGH"
echo

sleep 1

echo
echo "6️⃣ Update Status → SCHEDULED"
curl -s -X PATCH "$BASE_URL/api/announcements/$ANNOUNCEMENT_ID/status" \
  -H "$JSON" \
  -d '{ "status": "SCHEDULED" }'
echo

sleep 1

echo
echo "7️⃣ Negative Test → Missing Fields"
curl -s -X POST $BASE_URL/api/announcements \
  -H "$JSON" \
  -d '{
    "title": "Incomplete"
  }'
echo

sleep 1

echo
echo "8️⃣ Negative Test → Invalid Status"
curl -s -X PATCH "$BASE_URL/api/announcements/$ANNOUNCEMENT_ID/status" \
  -H "$JSON" \
  -d '{ "status": "DELETED" }'
echo

echo
echo "===================================="
echo "ANNOUNCEMENTS SERVICE TEST COMPLETED"
echo "===================================="
