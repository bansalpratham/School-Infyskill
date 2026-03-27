#!/bin/bash

BASE_URL="http://localhost:4010"

echo "===================================="
echo "DASHBOARD SERVICE FULL TEST START"
echo "===================================="
echo ""

echo "1️⃣ Health Check"
curl -s $BASE_URL/health
echo ""
echo ""

echo "2️⃣ Get Dashboard Overview"
OVERVIEW_RESPONSE=$(curl -s $BASE_URL/api/dashboard/overview)
echo $OVERVIEW_RESPONSE
echo ""

echo "3️⃣ Extract Key Fields"

STUDENTS=$(echo $OVERVIEW_RESPONSE | grep -o '"students":{"total":[0-9]*' | grep -o '[0-9]*')
TEACHERS=$(echo $OVERVIEW_RESPONSE | grep -o '"teachers":{"total":[0-9]*' | grep -o '[0-9]*')
PAYMENTS=$(echo $OVERVIEW_RESPONSE | grep -o '"payments":{"total":[0-9]*' | grep -o '[0-9]*')

echo "Students Count  : $STUDENTS"
echo "Teachers Count  : $TEACHERS"
echo "Payments Count  : $PAYMENTS"
echo ""

echo "4️⃣ Downstream Error Check"

ERROR_CHECK=$(echo $OVERVIEW_RESPONSE | grep '"errors":null')

if [ -n "$ERROR_CHECK" ]; then
  echo "✅ No downstream service errors detected"
else
  echo "⚠️ Partial failure detected in one or more services"
fi

echo ""
echo "===================================="
echo "DASHBOARD SERVICE TEST COMPLETED"
echo "===================================="
