# Order Service - Seller Support Implementation

**Date**: November 11, 2025  
**Status**: ✅ COMPLETED - Backend modifications done

---

## 🎯 OBJECTIVE

Add seller support to order-service so sellers can view and manage their orders.

---

## ✅ MODIFICATIONS COMPLETED

### 1. **Order.java** - Entity Model
**File**: `order-service/src/main/java/tn/esprit/spring/orderservice/entity/Order.java`

**Changes**:
```java
// Added field
@Column(name = "seller_id")
private String sellerId;

// Added getter/setter
public String getSellerId() { return sellerId; }
public void setSellerId(String sellerId) { this.sellerId = sellerId; }
```

---

### 2. **OrderRepository.java** - Data Access Layer
**File**: `order-service/src/main/java/tn/esprit/spring/orderservice/repository/OrderRepository.java`

**New Methods**:
```java
// Find all orders for a seller
List<Order> findBySellerId(String sellerId);

// Find orders by seller and status
List<Order> findBySellerIdAndStatus(String sellerId, String status);

// Find order by ID and seller (security)
Optional<Order> findByIdAndSellerId(Long id, String sellerId);
```

---

### 3. **OrderService.java** - Business Logic
**File**: `order-service/src/main/java/tn/esprit/spring/orderservice/service/OrderService.java`

**New Methods**:
```java
// Get all orders for a seller
@Transactional(readOnly = true)
public List<OrderResponse> getOrdersBySellerId(String sellerId)

// Get specific order for a seller (with access control)
@Transactional(readOnly = true)
public OrderResponse getOrderByIdAndSellerId(Long orderId, String sellerId)
```

**Modified Methods**:
```java
// Updated createOrder() to set sellerId
order.setSellerId(request.getSellerId());

// Updated mapToOrderResponse() to include sellerId
response.setSellerId(order.getSellerId());
```

---

### 4. **OrderController.java** - REST API
**File**: `order-service/src/main/java/tn/esprit/spring/orderservice/controller/OrderController.java`

**New Endpoints**:

#### Get All Seller Orders
```java
@GetMapping("/seller")
GET /api/orders/seller
Authorization: Bearer <JWT_TOKEN>
Response: List<OrderResponse>
```
- Extracts sellerId from JWT token
- Returns all orders for that seller
- Includes full order details

#### Get Specific Seller Order
```java
@GetMapping("/{orderId}/seller")
GET /api/orders/{orderId}/seller
Authorization: Bearer <JWT_TOKEN>
Response: OrderResponse
```
- Extracts sellerId from JWT token
- Returns order only if it belongs to the seller
- 404 if order not found or access denied

**New Helper Method**:
```java
private String extractSellerIdFromToken(HttpServletRequest request)
```
- Extracts seller ID from JWT "sub" claim
- Used for authentication and authorization

---

### 5. **CreateOrderRequest.java** - Request DTO
**File**: `order-service/src/main/java/tn/esprit/spring/orderservice/dto/CreateOrderRequest.java`

**Changes**:
```java
// Added field
private String sellerId;

// Added getter/setter
public String getSellerId() { return sellerId; }
public void setSellerId(String sellerId) { this.sellerId = sellerId; }
```

---

### 6. **OrderResponse.java** - Response DTO
**File**: `order-service/src/main/java/tn/esprit/spring/orderservice/dto/OrderResponse.java`

**Changes**:
```java
// Added field
private String sellerId;

// Added getter/setter
public String getSellerId() { return sellerId; }
public void setSellerId(String sellerId) { this.sellerId = sellerId; }

// Updated constructor
public OrderResponse(Long id, String customerId, String sellerId, ...)
```

---

### 7. **Database Migration**
**File**: `order-service/src/main/resources/db/migration/V2__add_seller_id_to_orders.sql`

**SQL Script**:
```sql
-- Add seller_id column
ALTER TABLE orders ADD COLUMN seller_id VARCHAR(255);

-- Add index for performance
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
```

**⚠️ IMPORTANT**: You need to run this migration on your database!

---

## 📋 NEW API ENDPOINTS

### Customer Endpoints (Existing)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | JWT | Create order |
| GET | `/api/orders/customer/{id}` | JWT | Get customer orders |
| GET | `/api/orders/{id}` | JWT | Get order by ID |
| GET | `/api/orders/{id}/customer/{customerId}` | JWT | Get order (secure) |

### Seller Endpoints (NEW) ✨
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/orders/seller` | JWT | Get all seller orders |
| GET | `/api/orders/{id}/seller` | JWT | Get order by ID (seller) |

---

## 🔐 AUTHENTICATION

All seller endpoints use JWT Bearer token authentication:

```http
GET /api/orders/seller HTTP/1.1
Host: localhost:8081
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The `sellerId` is automatically extracted from the JWT token's `sub` claim.

---

## 📊 RESPONSE EXAMPLES

### Get Seller Orders
```json
[
  {
    "id": 1,
    "customerId": "673252a4a24bc220c0c07da8",
    "sellerId": "67325396a24bc220c0c07dab",
    "orderDate": "2025-11-11T10:30:00",
    "totalAmount": 150.00,
    "status": "PENDING",
    "items": [
      {
        "id": 1,
        "productId": "673253daa24bc220c0c07dac",
        "quantity": 2,
        "price": 75.00,
        "totalPrice": 150.00
      }
    ]
  }
]
```

### Error Responses
```json
// 401 Unauthorized
{
  "message": "Authorization header missing or invalid"
}

// 404 Not Found
{
  "message": "Order not found or access denied"
}
```

---

## 🔄 DATA FLOW

### Creating Order with Seller
```
1. Customer selects products from seller
2. Frontend sends POST /api/orders with sellerId
3. OrderService creates order with sellerId
4. Order saved with seller_id in database
```

### Seller Viewing Orders
```
1. Seller logs in, gets JWT token
2. Frontend calls GET /api/orders/seller
3. Backend extracts sellerId from JWT
4. Repository queries orders by sellerId
5. Returns list of seller's orders
```

---

## 🚨 NEXT STEPS

### Backend
1. ✅ Code modifications completed
2. ⏳ **Compile order-service**: `mvnw clean compile`
3. ⏳ **Run database migration**: Execute V2__add_seller_id_to_orders.sql
4. ⏳ **Package service**: `mvnw clean package -DskipTests`
5. ⏳ **Start service**: `java -jar target/order-service-*.jar`
6. ⏳ **Test endpoints**: Use Postman or curl

### Frontend
1. ⏳ Create OrderService method: `getSellerOrders()`
2. ⏳ Create SellerOrdersComponent (list view)
3. ⏳ Create SellerOrderDetailComponent
4. ⏳ Add routes: `/seller/orders` and `/seller/orders/:id`
5. ⏳ Update seller dashboard with "My Orders" button
6. ⏳ Test complete seller workflow

### Testing Checklist
- [ ] Compile without errors
- [ ] Database migration successful
- [ ] Service starts on port 8081
- [ ] GET /api/orders/seller returns 200
- [ ] Seller can see only their orders
- [ ] Seller can view order details
- [ ] Customer orders still work
- [ ] JWT authentication working

---

## 🐛 TROUBLESHOOTING

### Compilation Errors
If you see errors, make sure:
- All getters/setters are added
- Imports are correct
- Method signatures match

### Database Issues
If migration fails:
- Check if column already exists
- Verify database connection
- Run manually if needed

### Runtime Errors
If service crashes:
- Check logs for stack traces
- Verify JWT token format
- Ensure database is running

---

## 📝 NOTES

- The sellerId field is optional for backward compatibility
- Existing orders will have NULL sellerId until updated
- Frontend must send sellerId when creating orders
- Sellers can only see their own orders (enforced by repository queries)
- JWT token must contain valid "sub" claim with seller ID

---

## 👤 AUTHOR

AI Assistant (GitHub Copilot)  
Working with: Firas Mahjoubi  
Repository: E-Commerce-Micro-services
