package tn.esprit.refundservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import tn.esprit.refundservice.client.OrderClient;
import tn.esprit.refundservice.client.ProductClient;
import tn.esprit.refundservice.dto.OrderDto;
import tn.esprit.refundservice.dto.ProductDto;

import java.util.List;
import java.util.Optional;

/**
 * Integration service for communicating with Order and Product services
 * Uses Feign clients for REST API calls
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RefundIntegrationService {

    private final OrderClient orderClient;
    private final ProductClient productClient;

    // ========== ORDER SERVICE INTEGRATION ==========

    /**
     * Verify if order exists
     */
    public boolean verifyOrderExists(Long orderId) {
        try {
            ResponseEntity<OrderDto> response = orderClient.getOrderById(orderId);
            boolean exists = response.getStatusCode().is2xxSuccessful() && response.getBody() != null;
            log.info("Order {} verification: {}", orderId, exists ? "EXISTS" : "NOT FOUND");
            return exists;
        } catch (Exception e) {
            log.error("Error verifying order {}: {}", orderId, e.getMessage());
            return false;
        }
    }

    /**
     * Get order details
     */
    public Optional<OrderDto> getOrderDetails(Long orderId) {
        try {
            ResponseEntity<OrderDto> response = orderClient.getOrderById(orderId);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Successfully retrieved order {}", orderId);
                return Optional.of(response.getBody());
            }
            log.warn("Order {} not found", orderId);
            return Optional.empty();
        } catch (Exception e) {
            log.error("Error fetching order {}: {}", orderId, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Verify order belongs to customer
     */
    public boolean verifyOrderOwnership(Long orderId, String customerId) {
        try {
            ResponseEntity<OrderDto> response = orderClient.getOrderByIdAndCustomer(orderId, customerId);
            boolean isOwner = response.getStatusCode().is2xxSuccessful() && response.getBody() != null;
            log.info("Order {} ownership verification for customer {}: {}",
                    orderId, customerId, isOwner ? "CONFIRMED" : "DENIED");
            return isOwner;
        } catch (Exception e) {
            log.error("Error verifying order ownership for order {} and customer {}: {}",
                    orderId, customerId, e.getMessage());
            return false;
        }
    }

    /**
     * Get customer's orders
     */
    public List<OrderDto> getCustomerOrders(String customerId) {
        try {
            ResponseEntity<List<OrderDto>> response = orderClient.getOrdersByCustomer(customerId);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Retrieved {} orders for customer {}", response.getBody().size(), customerId);
                return response.getBody();
            }
            return List.of();
        } catch (Exception e) {
            log.error("Error fetching orders for customer {}: {}", customerId, e.getMessage());
            return List.of();
        }
    }

    /**
     * Update order status (e.g., after refund approval)
     */
    public boolean updateOrderStatus(Long orderId, String status) {
        try {
            ResponseEntity<OrderDto> response = orderClient.updateOrderStatus(orderId, status);
            boolean updated = response.getStatusCode().is2xxSuccessful();
            log.info("Order {} status update to {}: {}", orderId, status, updated ? "SUCCESS" : "FAILED");
            return updated;
        } catch (Exception e) {
            log.error("Error updating order {} status to {}: {}", orderId, status, e.getMessage());
            return false;
        }
    }

    // ========== PRODUCT SERVICE INTEGRATION ==========

    /**
     * Verify if product exists
     */
    public boolean verifyProductExists(String productId) {
        try {
            ResponseEntity<ProductDto> response = productClient.getProductById(productId);
            boolean exists = response.getStatusCode().is2xxSuccessful() && response.getBody() != null;
            log.info("Product {} verification: {}", productId, exists ? "EXISTS" : "NOT FOUND");
            return exists;
        } catch (Exception e) {
            log.error("Error verifying product {}: {}", productId, e.getMessage());
            return false;
        }
    }

    /**
     * Get product details
     */
    public Optional<ProductDto> getProductDetails(String productId) {
        try {
            ResponseEntity<ProductDto> response = productClient.getProductById(productId);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Successfully retrieved product {}", productId);
                return Optional.of(response.getBody());
            }
            log.warn("Product {} not found", productId);
            return Optional.empty();
        } catch (Exception e) {
            log.error("Error fetching product {}: {}", productId, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Verify all products in a list exist
     */
    public boolean verifyAllProductsExist(List<String> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return true;
        }

        for (String productId : productIds) {
            if (!verifyProductExists(productId)) {
                log.warn("Product verification failed for: {}", productId);
                return false;
            }
        }
        log.info("All {} products verified successfully", productIds.size());
        return true;
    }

    /**
     * Get products by seller
     */
    public List<ProductDto> getSellerProducts(String sellerId) {
        try {
            ResponseEntity<List<ProductDto>> response = productClient.getProductsBySeller(sellerId);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Retrieved {} products for seller {}", response.getBody().size(), sellerId);
                return response.getBody();
            }
            return List.of();
        } catch (Exception e) {
            log.error("Error fetching products for seller {}: {}", sellerId, e.getMessage());
            return List.of();
        }
    }

    /**
     * Verify product belongs to seller
     */
    public boolean verifyProductOwnership(String productId, String sellerId) {
        try {
            Optional<ProductDto> product = getProductDetails(productId);
            if (product.isPresent()) {
                boolean isOwner = product.get().getSellerId().equals(sellerId);
                log.info("Product {} ownership verification for seller {}: {}",
                        productId, sellerId, isOwner ? "CONFIRMED" : "DENIED");
                return isOwner;
            }
            return false;
        } catch (Exception e) {
            log.error("Error verifying product ownership for product {} and seller {}: {}",
                    productId, sellerId, e.getMessage());
            return false;
        }
    }

    // ========== HEALTH CHECKS ==========

    /**
     * Check if Order Service is available
     */
    public boolean isOrderServiceAvailable() {
        try {
            ResponseEntity<String> response = orderClient.healthCheck();
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.error("Order service health check failed: {}", e.getMessage());
            return false;
        }
    }
}
