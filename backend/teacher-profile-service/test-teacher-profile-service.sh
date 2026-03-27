#!/bin/bash

BASE_URL="http://localhost:4011"  

echo "====================================="
echo "TEACHER PROFILE SERVICE FULL TEST START"
echo "====================================="

echo ""
echo "1️⃣ Health Check"
curl -s $BASE_URL/health
echo ""
echo ""

# -----------------------------
# 🔹 MANUAL TEACHER ID (RECOMMENDED)
# -----------------------------

TEACHER_ID="PASTE_YOUR_REAL_ID_HERE"


if [ "$TEACHER_ID" = "PASTE_YOUR_REAL_ID_HERE" ]; then
  echo "🔎 Trying auto-fetch from MongoDB..."
  TEACHER_ID=$(mongosh --quiet --eval \
  'db.teacherprofiles.findOne({}, {_id:1})?._id.toString()' school 2>/dev/null)
fi

if [ -z "$TEACHER_ID" ]; then
  echo "❌ No teacher found in DB."
  echo "Please insert one manually and paste ID inside script."
  exit 1
fi

echo "Using TEACHER_ID = $TEACHER_ID"
echo ""

echo "2️⃣ Get Teacher Profile"
curl -s $BASE_URL/api/teacher/profile/$TEACHER_ID
echo ""
echo ""

echo "3️⃣ Update Teacher Profile"
curl -s -X PATCH $BASE_URL/api/teacher/profile/$TEACHER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9999999999",
    "experience": "15 years",
    "status": "ACTIVE"
  }'
echo ""
echo ""

echo "4️⃣ Negative Test → Invalid ID"
curl -s $BASE_URL/api/teacher/profile/123
echo ""
echo ""

echo "5️⃣ Negative Test → Invalid Status"
curl -s -X PATCH $BASE_URL/api/teacher/profile/$TEACHER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INVALID_STATUS"
  }'
echo ""
echo ""

echo "====================================="
echo "TEACHER PROFILE SERVICE TEST COMPLETED"
echo "====================================="
