# Postman Testing Guide - Product & Inventory Services

## 📋 Overview
This guide will help you manually test the Product Service and Inventory Service using Postman.

## 🚀 Prerequisites

### 1. Services Running
Ensure these services are running:
- ✅ **Eureka Server** - `http://localhost:8761`
- ✅ **API Gateway** - `http://localhost:8090`
- ✅ **Product Service** - `http://localhost:8092`
- ✅ **Inventory Service** - `http://localhost:8091`
- ✅ **Keycloak** - `http://localhost:8080` (for authentication)

### 2. MongoDB & MySQL
- ✅ MongoDB running on `localhost:27017` (for Product Service)
- ✅ MySQL running on `localhost:3306` (for Inventory Service)

---

## 📥 Import Postman Collection

### Method 1: Import from File
1. Open Postman
2. Click **Import** button (top left)
3. Click **Choose Files**
4. Select `Product-Inventory-Postman-Collection.json`
5. Click **Import**

### Method 2: Import from URL
1. Open Postman
2. Click **Import** → **Link**
3. Paste the collection JSON URL
4. Click **Continue** → **Import**

---

## 🔐 Authentication Setup

### Get JWT Token from Keycloak

#### For SELLER Role:
```bash
# Request
POST http://localhost:8080/realms/Ecommerce/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

Body (x-www-form-urlencoded):
grant_type=password
client_id=ecommerce-client
username=seller@example.com
password=seller123
```

#### For CUSTOMER Role:
```bash
# Request
POST http://localhost:8080/realms/Ecommerce/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

Body (x-www-form-urlencoded):
grant_type=password
client_id=ecommerce-client
username=customer@example.com
password=customer123
```

### Set Token in Postman
1. Copy the `access_token` from the response
2. In Postman, go to the collection **Variables** tab
3. Set `authToken` variable to the copied token value
4. **Save** the collection

---

## 🧪 Testing Workflow

### Phase 1: Product Service - Basic CRUD

#### Test 1: Create Product (SELLER Authentication Required)
**Request:** `POST {{baseUrl}}/api/product`
```json
{
  "name": "iPhone 15 Pro Max",
  "description": "Latest iPhone with A17 Pro chip",
  "price": 1299.99,
  "skuCode": "IPHONE-15-PRO-MAX-256GB",
  "category": "Electronics",
  "imageUrls": [
    "/api/product/upload/iphone15.jpg"
  ],
  "stockQuantity": 50,
  "active": true
}
```

**Expected Response:** `201 Created`
```json
{
  "id": "6912fe45c5444b2cbdbcafd8",
  "name": "iPhone 15 Pro Max",
  "sellerId": "extracted-from-jwt-token",
  ...
}
```

**✅ Verification:**
- Status code is 201
- Response contains `id` and `sellerId`
- Copy the `id` value and save it in collection variable `productId`

---

#### Test 2: Get All Products (Public Access)
**Request:** `GET {{baseUrl}}/api/product`
(No authorization header)

**Expected Response:** `200 OK`
```json
[
  {
    "id": "6912fe45c5444b2cbdbcafd8",
    "name": "iPhone 15 Pro Max",
    ...
  }
]
```

**✅ Verification:**
- Returns array of all products
- Public access works without authentication

---

#### Test 3: Get Product by ID
**Request:** `GET {{baseUrl}}/api/product/{{productId}}`

**Expected Response:** `200 OK`
```json
{
  "id": "6912fe45c5444b2cbdbcafd8",
  "name": "iPhone 15 Pro Max",
  ...
}
```

---

#### Test 4: Update Product
**Request:** `PUT {{baseUrl}}/api/product/{{productId}}`
**Headers:** `Authorization: Bearer {{authToken}}`
```json
{
  "name": "iPhone 15 Pro Max - Special Edition",
  "description": "Updated description",
  "price": 1199.99,
  "skuCode": "IPHONE-15-PRO-MAX-256GB",
  "category": "Electronics",
  "imageUrls": [
    "/api/product/upload/iphone15-updated.jpg"
  ],
  "stockQuantity": 75,
  "active": true
}
```

**Expected Response:** `200 OK` with updated product

---

### Phase 2: Product Service - Advanced Features

#### Test 5: Search Products by Name
**Request:** `GET {{baseUrl}}/api/product/search?name=iPhone`

**Expected Response:** Products containing "iPhone" in the name

---

#### Test 6: Filter by Category
**Request:** `GET {{baseUrl}}/api/product/category/Electronics`

**Expected Response:** All products in "Electronics" category

---

#### Test 7: Get Products by Price Range
**Request:** `GET {{baseUrl}}/api/product/price-range?minPrice=100&maxPrice=1500`

**Expected Response:** Products with price between 100 and 1500

---

#### Test 8: Get Active Products Only
**Request:** `GET {{baseUrl}}/api/product/active`

**Expected Response:** Only products where `active = true`

---

#### Test 9: Get Low Stock Products
**Request:** `GET {{baseUrl}}/api/product/low-stock?threshold=20`
**Headers:** `Authorization: Bearer {{authToken}}`

**Expected Response:** Products with stockQuantity < 20

---

### Phase 3: File Upload

#### Test 10: Upload Single Image
**Request:** `POST {{baseUrl}}/api/product/upload`
**Body:** `form-data`
- Key: `file` (type: File)
- Value: Select an image file

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "filename": "uuid-generated-filename.jpg",
  "url": "/api/product/upload/uuid-generated-filename.jpg",
  "size": 123456,
  "contentType": "image/jpeg"
}
```

**✅ Save the `url` value to use in product creation**

---

#### Test 11: Upload Multiple Images
**Request:** `POST {{baseUrl}}/api/product/upload/multiple`
**Body:** `form-data`
- Key: `files` (type: File) - Add multiple entries

**Expected Response:** Array of uploaded file URLs

---

### Phase 4: Inventory Service - Basic CRUD

#### Test 12: Create Inventory
**Request:** `POST {{baseUrl}}/api/inventory`
```json
{
  "skuCode": "IPHONE-15-PRO-MAX-256GB",
  "quantity": 100
}
```

**Expected Response:** `201 Created`
```json
{
  "id": 1,
  "skuCode": "IPHONE-15-PRO-MAX-256GB",
  "quantity": 100
}
```

**✅ Save `skuCode` in collection variable**

---

#### Test 13: Check Stock (Multiple SKUs)
**Request:** `GET {{baseUrl}}/api/inventory?skuCode=IPHONE-15-PRO-MAX-256GB&skuCode=SAMSUNG-S24-ULTRA`

**Expected Response:** `200 OK`
```json
[
  {
    "skuCode": "IPHONE-15-PRO-MAX-256GB",
    "isInStock": true,
    "quantity": 100
  },
  {
    "skuCode": "SAMSUNG-S24-ULTRA",
    "isInStock": false,
    "quantity": 0
  }
]
```

---

#### Test 14: Get All Inventory
**Request:** `GET {{baseUrl}}/api/inventory/all`

**Expected Response:** Array of all inventory records

---

#### Test 15: Get Inventory by SKU Code
**Request:** `GET {{baseUrl}}/api/inventory/{{skuCode}}`

**Expected Response:** Single inventory record

---

#### Test 16: Update Inventory
**Request:** `PUT {{baseUrl}}/api/inventory/{{skuCode}}`
```json
{
  "skuCode": "IPHONE-15-PRO-MAX-256GB",
  "quantity": 150
}
```

**Expected Response:** `200 OK` with updated inventory

---

### Phase 5: Inventory Service - Stock Management

#### Test 17: Increase Stock
**Request:** `PATCH {{baseUrl}}/api/inventory/{{skuCode}}/increase?quantity=50`

**Expected Response:** `200 OK`
```json
{
  "skuCode": "IPHONE-15-PRO-MAX-256GB",
  "quantity": 200
}
```

**✅ Verify quantity increased by 50**

---

#### Test 18: Decrease Stock
**Request:** `PATCH {{baseUrl}}/api/inventory/{{skuCode}}/decrease?quantity=10`

**Expected Response:** Quantity decreased by 10

---

#### Test 19: Get Low Stock Items
**Request:** `GET {{baseUrl}}/api/inventory/low-stock?threshold=20`

**Expected Response:** Items with quantity < 20

---

#### Test 20: Get Out of Stock Items
**Request:** `GET {{baseUrl}}/api/inventory/out-of-stock`

**Expected Response:** Items with quantity = 0

---

## 🔄 Integration Testing Scenarios

### Scenario 1: Complete Product Creation Flow
1. **Upload product images** → Get image URLs
2. **Create inventory** for the SKU code
3. **Create product** with image URLs and SKU code
4. **Verify inventory sync** by checking stock
5. **Get product** and verify all data

---

### Scenario 2: Stock Management Flow
1. **Create product** with initial stock (e.g., 50)
2. **Create inventory** with matching SKU code
3. **Check stock** via inventory API
4. **Decrease stock** (simulate sale)
5. **Verify low stock alert** if below threshold
6. **Increase stock** (simulate restocking)
7. **Verify stock updated** in both services

---

### Scenario 3: Seller Product Management
1. **Login as SELLER** → Get JWT token
2. **Create multiple products** under this seller
3. **Get all products** (should return only seller's products when authenticated)
4. **Get products by seller ID**
5. **Update one product**
6. **Get low stock products** for inventory management
7. **Delete a product**

---

### Scenario 4: Customer Shopping Experience
1. **Browse all products** (no authentication)
2. **Filter by category**
3. **Search by name**
4. **Filter by price range**
5. **Get product details**
6. **Check stock availability** via inventory
7. **Get active products only**

---

## ✅ Success Criteria Checklist

### Product Service
- [ ] ✅ Create product with SELLER authentication
- [ ] ✅ Get all products (public & authenticated)
- [ ] ✅ Get product by ID
- [ ] ✅ Update product
- [ ] ✅ Delete product
- [ ] ✅ Search by name
- [ ] ✅ Filter by category
- [ ] ✅ Filter by price range
- [ ] ✅ Get active products
- [ ] ✅ Get low stock products
- [ ] ✅ Get products by seller ID
- [ ] ✅ Upload single image
- [ ] ✅ Upload multiple images

### Inventory Service
- [ ] ✅ Create inventory
- [ ] ✅ Check stock (multiple SKUs)
- [ ] ✅ Get all inventory
- [ ] ✅ Get inventory by SKU
- [ ] ✅ Update inventory
- [ ] ✅ Delete inventory
- [ ] ✅ Increase stock
- [ ] ✅ Decrease stock
- [ ] ✅ Get low stock items
- [ ] ✅ Get out of stock items

---

## 🐛 Troubleshooting

### Issue: 401 Unauthorized
**Solution:** 
- Verify JWT token is valid (tokens expire after ~15 minutes)
- Get a fresh token from Keycloak
- Update `authToken` variable in Postman

### Issue: 403 Forbidden
**Solution:**
- Verify user has correct role (SELLER for product creation)
- Check if seller is trying to access another seller's products

### Issue: 404 Not Found
**Solution:**
- Verify service is running
- Check if product/inventory ID/SKU exists
- Verify API Gateway routes are configured

### Issue: 503 Service Unavailable
**Solution:**
- Check if service is registered with Eureka
- Verify service health at `http://localhost:8761`
- Restart the service if needed

### Issue: 500 Internal Server Error
**Solution:**
- Check service logs for stack traces
- Verify database connections (MongoDB/MySQL)
- Ensure required data is provided in request body

---

## 📊 Testing Tips

1. **Use Collection Variables** - Store `productId`, `skuCode`, `authToken` as variables
2. **Test Scripts** - Add Postman test scripts to automate verification
3. **Environment Management** - Create separate environments for dev/staging/prod
4. **Pre-request Scripts** - Auto-refresh JWT tokens before requests
5. **Collection Runner** - Run entire collection to regression test all endpoints
6. **Monitor Response Times** - Track API performance
7. **Save Responses** - Document expected responses as examples

---

## 📝 Notes

- **API Gateway URL**: `http://localhost:8090` routes to all services
- **Direct Service URLs**: Use for debugging
  - Product: `http://localhost:8092`
  - Inventory: `http://localhost:8091`
- **JWT Token Expiry**: ~15 minutes (refresh as needed)
- **File Upload Limit**: Check `spring.servlet.multipart.max-file-size` in properties

---

## 🎯 Next Steps

After completing manual testing:
1. ✅ Automate tests with Postman Collection Runner
2. ✅ Add test assertions in Postman
3. ✅ Integrate with CI/CD pipeline (Newman CLI)
4. ✅ Monitor API metrics via Grafana/Prometheus
5. ✅ Test error scenarios (invalid data, edge cases)

---

**Happy Testing! 🚀**
