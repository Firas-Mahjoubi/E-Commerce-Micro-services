@echo off
echo ==========================================
echo    TESTING ORDER SERVICE APIS
echo ==========================================
echo.

echo 1. Testing Health endpoint...
curl -X GET http://localhost:8100/api/orders/health
echo.
echo.

echo 2. Creating a test order...
curl -X POST http://localhost:8100/api/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"customerId\": 1, \"items\": [{\"productId\": 101, \"quantity\": 2, \"price\": 25.99}, {\"productId\": 102, \"quantity\": 1, \"price\": 15.50}]}"
echo.
echo.

echo 3. Getting orders for customer 1...
curl -X GET http://localhost:8100/api/orders/customer/1
echo.
echo.

echo 4. Getting order by ID 1...
curl -X GET http://localhost:8100/api/orders/1
echo.
echo.

echo Tests completed!
pause