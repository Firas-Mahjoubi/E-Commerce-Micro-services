# Backend Issues Report - Refund & Order Services

**Date**: November 11, 2025  
**Status**: CRITICAL - Seller cannot see orders and refunds

---

## 🔴 CRITICAL ISSUES

### 1. **Refund-Service: Missing GET endpoint for single refund (Seller)**

**Problem**: The `SellerRefundController` was missing an endpoint to get a specific refund by ID.

**Status**: ✅ **FIXED**

**Solution Applied**:
```java
// Added to SellerRefundController.java
@GetMapping("/{refundId}")
public ResponseEntity<?> getRefundById(@PathVariable Long refundId, HttpServletRequest request) {
    String sellerId = extractSellerIdFromToken(request);
    RefundResponseDto response = refundService.getSellerRefundDetails(refundId, sellerId);
    return ResponseEntity.ok(response);
}

// Added to RefundService.java interface
RefundResponseDto getSellerRefundDetails(Long refundId, String sellerId);

// Added to RefundServiceImpl.java
@Override
public RefundResponseDto getSellerRefundDetails(Long refundId, String sellerId) {
    Refund refund = refundRepository.findByRefundIdAndSellerId(refundId, sellerId)
            .orElseThrow(() -> new RuntimeException("Refund not found or access denied"));
    return convertToDto(refund);
}
```

**Endpoint**: `GET /api/seller/refunds/{refundId}`  
**Auth**: JWT Bearer token (extracts sellerId from token)  
**Response**: Single RefundResponseDto

---

### 2. **Order-Service: NO seller endpoints exist**

**Problem**: The `OrderController` has ZERO endpoints for sellers to retrieve their orders.

**Current Situation**:
- ✅ Customers can get their orders: `GET /api/orders/customer/{customerId}`
- ❌ Sellers **CANNOT** get their orders: **NO ENDPOINT EXISTS**

**Root Cause Analysis**:

The `Order` entity does **NOT** have a `sellerId` field:
```java
@Entity
@Table(name = "orders")
public class Order {
    private Long id;
    private String customerId;  // ✅ Has customer ID
    private LocalDateTime orderDate;
    private Double totalAmount;
    private String status;
    private List<OrderItem> items;
    // ❌ NO sellerId field!
}
```

The `OrderItem` entity stores `productId` but not `sellerId`:
```java
@Entity
public class OrderItem {
    private Long id;
    private String productId;  // ✅ Product ID exists
    private Integer quantity;
    private Double price;
    // ❌ NO sellerId field!
}
```

**Why This is a Problem**:
1. Orders don't track which seller sold the products
2. Cannot directly query orders by seller
3. Seller cannot see which orders contain their products
4. Refund service stores `sellerId` but order service doesn't!

**Impact**:
- ❌ Sellers cannot see their orders
- ❌ Sellers cannot track their sales
- ❌ Sellers cannot see order status for products they sold
- ❌ Frontend seller dashboard shows no orders

---

## 🔧 REQUIRED FIXES

### Option 1: Add sellerId to Order entity (RECOMMENDED)

**Pros**:
- Simple and efficient
- Direct database queries possible
- Consistent with refund-service design

**Cons**:
- Requires database migration
- Assumes one seller per order (multi-seller orders not supported)

**Implementation**:
```java
// 1. Update Order.java
@Entity
@Table(name = "orders")
public class Order {
    // ... existing fields ...
    
    @Column(name = "seller_id")
    private String sellerId;  // ADD THIS
    
    // Add getter/setter
}

// 2. Update OrderRepository.java
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(String customerId);
    List<Order> findBySellerId(String sellerId);  // ADD THIS
    Optional<Order> findByIdAndCustomerId(Long id, String customerId);
    Optional<Order> findByIdAndSellerId(Long id, String sellerId);  // ADD THIS
}

// 3. Update OrderService.java
public List<OrderResponse> getOrdersBySellerId(String sellerId) {
    log.info("Fetching orders for seller: {}", sellerId);
    List<Order> orders = orderRepository.findBySellerId(sellerId);
    return orders.stream()
            .map(this::mapToOrderResponse)
            .toList();
}

// 4. Add OrderController.java endpoint
@GetMapping("/seller/{sellerId}")
public ResponseEntity<List<OrderResponse>> getOrdersBySeller(
        @PathVariable String sellerId,
        HttpServletRequest httpRequest) {
    // Extract sellerId from JWT and verify it matches path parameter
    String tokenSellerId = extractSellerIdFromToken(httpRequest);
    if (!tokenSellerId.equals(sellerId)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
    List<OrderResponse> orders = orderService.getOrdersBySellerId(sellerId);
    return ResponseEntity.ok(orders);
}
```

**Database Migration Required**:
```sql
-- Add seller_id column to orders table
ALTER TABLE orders ADD COLUMN seller_id VARCHAR(255);

-- For existing data, you'll need to populate seller_id
-- by joining with order_items and products tables
UPDATE orders o
SET seller_id = (
    SELECT p.seller_id 
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = o.id
    LIMIT 1
);
```

---

### Option 2: Cross-service query via ProductService (COMPLEX)

**Pros**:
- No database schema changes
- Supports multi-seller orders (if needed in future)

**Cons**:
- Much more complex
- Requires ProductService integration
- Slower performance (multiple service calls)
- More points of failure

**Implementation** (pseudo-code):
```java
// OrderService.java
@Autowired
private ProductClient productClient;

public List<OrderResponse> getOrdersContainingSellerProducts(String sellerId) {
    // 1. Get all product IDs for this seller from product-service
    List<String> sellerProductIds = productClient.getProductIdsBySeller(sellerId);
    
    // 2. Get ALL orders (expensive!)
    List<Order> allOrders = orderRepository.findAll();
    
    // 3. Filter orders that contain seller's products
    List<Order> sellerOrders = allOrders.stream()
        .filter(order -> order.getItems().stream()
            .anyMatch(item -> sellerProductIds.contains(item.getProductId())))
        .collect(Collectors.toList());
    
    return sellerOrders.stream()
        .map(this::mapToOrderResponse)
        .toList();
}
```

This approach is **NOT RECOMMENDED** for production.

---

## 📋 CURRENT STATUS

### Refund-Service
| Endpoint | Method | Customer | Seller | Status |
|----------|--------|----------|--------|--------|
| `/api/customer/refunds` | GET | ✅ | ❌ | Working |
| `/api/customer/refunds/{id}` | GET | ✅ | ❌ | Working |
| `/api/customer/refunds` | POST | ✅ | ❌ | Working |
| `/api/seller/refunds` | GET | ❌ | ✅ | Working |
| `/api/seller/refunds/{id}` | GET | ❌ | ✅ | **FIXED** ✅ |
| `/api/seller/refunds/{id}/status` | PUT | ❌ | ✅ | Working |

### Order-Service
| Endpoint | Method | Customer | Seller | Status |
|----------|--------|----------|--------|--------|
| `/api/orders` | POST | ✅ | ❌ | Working |
| `/api/orders/customer/{id}` | GET | ✅ | ❌ | Working |
| `/api/orders/{id}` | GET | ✅ | ❌ | Working |
| `/api/orders/{id}/status` | PUT | ✅ | ❌ | Working |
| `/api/orders/{id}/cancel/customer/{customerId}` | PUT | ✅ | ❌ | Working |
| `/api/orders/seller/{sellerId}` | GET | ❌ | ✅ | **MISSING** ❌ |

---

## 🎯 RECOMMENDED ACTION PLAN

1. **IMMEDIATE** (Do Now):
   - ✅ Fix refund-service GET endpoint (DONE)
   - ⏳ Add `sellerId` field to Order entity
   - ⏳ Create database migration script
   - ⏳ Update OrderRepository with seller queries
   - ⏳ Add OrderService.getOrdersBySellerId() method
   - ⏳ Add OrderController GET /api/orders/seller endpoint
   - ⏳ Rebuild and test order-service

2. **TESTING**:
   - Test customer creates order with products
   - Verify sellerId is saved correctly
   - Test seller can retrieve their orders
   - Test seller sees correct order details
   - Test seller can see refunds for their orders

3. **FRONTEND**:
   - Update OrderService to call seller endpoints
   - Create SellerOrdersComponent (list view)
   - Create SellerOrderDetailComponent
   - Test complete seller workflow

---

## 🔍 DATA INCONSISTENCY WARNING

**CRITICAL**: The refund-service stores `sellerId` but order-service doesn't!

```java
// Refund entity (refund-service)
@Entity
public class Refund {
    private Long refundId;
    private String orderId;
    private String customerId;
    private String sellerId;  // ✅ Has seller ID!
    // ...
}

// Order entity (order-service)
@Entity
public class Order {
    private Long id;
    private String customerId;
    // ❌ NO sellerId!
}
```

This means:
- Refunds are linked to sellers ✅
- Orders are NOT linked to sellers ❌
- Data model is inconsistent ❌

**Fix**: Add `sellerId` to Order entity to maintain data consistency.

---

## 📝 NOTES

- The refund-service properly extracts sellerId from JWT tokens
- The refund-service properly stores and queries by sellerId
- The order-service needs similar seller support
- Without seller tracking in orders, the business logic is incomplete

---

## 👤 AUTHOR

AI Assistant (GitHub Copilot)  
Working with: Firas Mahjoubi
Repository: E-Commerce-Micro-services
