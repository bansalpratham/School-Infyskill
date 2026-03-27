#!/bin/bash

BASE_URL="http://localhost:4009"
TMP_DIR="/tmp/import_export_test"
STUDENTS_XLSX="$TMP_DIR/students.xlsx"
FEES_XLSX="$TMP_DIR/fees.xlsx"

echo "=========================================="
echo "IMPORT-EXPORT SERVICE FULL TEST START"
echo "=========================================="

mkdir -p $TMP_DIR

echo
echo "1️⃣ Health Check"
curl -s $BASE_URL/health
echo

echo
echo "2️⃣ Create sample STUDENTS Excel"

python3 <<EOF
import pandas as pd

df = pd.DataFrame([
    {
        "firstName": "Aman",
        "lastName": "Sharma",
        "email": "aman@test.com",
        "phone": "9999999999",
        "className": "10A",
        "rollNumber": "10"
    },
    {
        "firstName": "Rohit",
        "lastName": "Verma",
        "email": "rohit@test.com",
        "phone": "8888888888",
        "className": "10B",
        "rollNumber": "12"
    }
])

df.to_excel("$STUDENTS_XLSX", index=False)
EOF

ls -lh $STUDENTS_XLSX

echo
echo "3️⃣ Import Students Excel"
curl -s -X POST "$BASE_URL/api/import/students" \
  -F "file=@$STUDENTS_XLSX"
echo

echo
echo "4️⃣ Create sample FEES Excel"

python3 <<EOF
import pandas as pd

df = pd.DataFrame([
    {
        "studentId": "aman@test.com",
        "totalAmount": 5000,
        "paidAmount": 2000
    },
    {
        "studentId": "rohit@test.com",
        "totalAmount": 6000,
        "paidAmount": 6000
    }
])

df.to_excel("$FEES_XLSX", index=False)
EOF

ls -lh $FEES_XLSX

echo
echo "5️⃣ Import Fees Excel"
curl -s -X POST "$BASE_URL/api/import/fees" \
  -F "file=@$FEES_XLSX"
echo

echo
echo "6️⃣ Export Students Excel"
curl -s -o "$TMP_DIR/exported_students.xlsx" \
  "$BASE_URL/api/export/students"

ls -lh "$TMP_DIR/exported_students.xlsx"

echo
echo "=========================================="
echo "IMPORT-EXPORT SERVICE TEST COMPLETED"
echo "=========================================="
