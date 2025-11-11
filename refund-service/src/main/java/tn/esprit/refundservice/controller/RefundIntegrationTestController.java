package tn.esprit.refundservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.refundservice.dto.OrderDto;
import tn.esprit.refundservice.dto.ProductDto;
import tn.esprit.refundservice.service.RefundIntegrationService;

import java.util.List;
import java.util.Map;

/**
 * Test Controller for Feign Client Integration
 * This controller demonstrates the communication between refund-service and
 * other services
 */
@RestController
@RequestMapping("/api/refund/integration-test")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RefundIntegrationTestController {

    private final RefundIntegrationService integrationService;

    // ========== ORDER SERVICE TEST ENDPOINTS ==========

    /**
     * Test: Verify if order exists
     * GET /api/refund/integration-test/order/{orderId}/verify
     */
    @GetMapping("/order/{orderId}/verify")
    public ResponseEntity<Map<String, Object>> testVerifyOrder(@PathVariable Long orderId) {
        boolean exists = integrationService.verifyOrderExists(orderId);
        return ResponseEntity.ok(Map.of(
                "orderId", orderId,
                "exists", exists,
                "message", exists ? "Order found" : "Order not found"));
    }

    /**
     * Test: Get order details
     * GET /api/refund/integration-test/order/{orderId}
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> testGetOrderDetails(@PathVariable Long orderId) {
        return integrationService.getOrderDetails(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Test: Verify order ownership
     * GET /api/refund/integration-test/order/{orderId}/owner/{customerId}
     */
    @GetMapping("/order/{orderId}/owner/{customerId}")
    public ResponseEntity<Map<String, Object>> testVerifyOrderOwnership(
            @PathVariable Long orderId,
            @PathVariable String customerId) {
        boolean isOwner = integrationService.verifyOrderOwnership(orderId, customerId);
        return ResponseEntity.ok(Map.of(
                "orderId", orderId,
                "customerId", customerId,
                "isOwner", isOwner,
                "message", isOwner ? "Customer owns this order" : "Customer does not own this order"));
    }

    /**
     * Test: Get customer orders
     * GET /api/refund/integration-test/customer/{customerId}/orders
     */
    @GetMapping("/customer/{customerId}/orders")
    public ResponseEntity<List<OrderDto>> testGetCustomerOrders(@PathVariable String customerId) {
        List<OrderDto> orders = integrationService.getCustomerOrders(customerId);
        return ResponseEntity.ok(orders);
    }

    // ========== PRODUCT SERVICE TEST ENDPOINTS ==========

    /**
     * Test: Verify if product exists
     * GET /api/refund/integration-test/product/{productId}/verify
     */
    @GetMapping("/product/{productId}/verify")
    public ResponseEntity<Map<String, Object>> testVerifyProduct(@PathVariable String productId) {
        boolean exists = integrationService.verifyProductExists(productId);
        return ResponseEntity.ok(Map.of(
                "productId", productId,
                "exists", exists,
                "message", exists ? "Product found" : "Product not found"));
    }

    /**
     * Test: Get product details
     * GET /api/refund/integration-test/product/{productId}
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> testGetProductDetails(@PathVariable String productId) {
        return integrationService.getProductDetails(productId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Test: Verify product ownership
     * GET /api/refund/integration-test/product/{productId}/owner/{sellerId}
     */
    @GetMapping("/product/{productId}/owner/{sellerId}")
    public ResponseEntity<Map<String, Object>> testVerifyProductOwnership(
            @PathVariable String productId,
            @PathVariable String sellerId) {
        boolean isOwner = integrationService.verifyProductOwnership(productId, sellerId);
        return ResponseEntity.ok(Map.of(
                "productId", productId,
                "sellerId", sellerId,
                "isOwner", isOwner,
                "message", isOwner ? "Seller owns this product" : "Seller does not own this product"));
    }

    /**
     * Test: Get seller products
     * GET /api/refund/integration-test/seller/{sellerId}/products
     */
    @GetMapping("/seller/{sellerId}/products")
    public ResponseEntity<List<ProductDto>> testGetSellerProducts(@PathVariable String sellerId) {
        List<ProductDto> products = integrationService.getSellerProducts(sellerId);
        return ResponseEntity.ok(products);
    }

    /**
     * Test: Verify multiple products exist
     * POST /api/refund/integration-test/products/verify
     */
    @PostMapping("/products/verify")
    public ResponseEntity<Map<String, Object>> testVerifyProducts(@RequestBody List<String> productIds) {
        boolean allExist = integrationService.verifyAllProductsExist(productIds);
        return ResponseEntity.ok(Map.of(
                "productIds", productIds,
                "allExist", allExist,
                "message", allExist ? "All products found" : "Some products not found"));
    }

    // ========== HEALTH CHECK ==========

    /**
     * Test: Check service connectivity
     * GET /api/refund/integration-test/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> testServicesHealth() {
        boolean orderServiceUp = integrationService.isOrderServiceAvailable();

        return ResponseEntity.ok(Map.of(
                "refundService", "UP",
                "orderService", orderServiceUp ? "UP" : "DOWN",
                "feignClientsConfigured", true,
                "message", "Feign client integration is configured correctly"));
    }
}
