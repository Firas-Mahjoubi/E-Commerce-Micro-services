package tn.esprit.refundservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import tn.esprit.refundservice.dto.OrderDto;

import java.util.List;

/**
 * Feign Client for Order Service
 * Enables refund-service to communicate with order-service via REST API calls
 */
@FeignClient(name = "order-service", url = "${order.service.url}")
public interface OrderClient {

    /**
     * Get order by ID
     * 
     * @param orderId the order ID
     * @return order details
     */
    @GetMapping("/api/orders/{orderId}")
    ResponseEntity<OrderDto> getOrderById(@PathVariable("orderId") Long orderId);

    /**
     * Get orders by customer ID
     * 
     * @param customerId the customer ID
     * @return list of orders
     */
    @GetMapping("/api/orders/customer/{customerId}")
    ResponseEntity<List<OrderDto>> getOrdersByCustomer(@PathVariable("customerId") String customerId);

    /**
     * Get order by ID and customer ID (for validation)
     * 
     * @param orderId    the order ID
     * @param customerId the customer ID
     * @return order details if belongs to customer
     */
    @GetMapping("/api/orders/{orderId}/customer/{customerId}")
    ResponseEntity<OrderDto> getOrderByIdAndCustomer(
            @PathVariable("orderId") Long orderId,
            @PathVariable("customerId") String customerId);

    /**
     * Update order status
     * 
     * @param orderId the order ID
     * @param status  the new status
     * @return updated order
     */
    @PutMapping("/api/orders/{orderId}/status")
    ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable("orderId") Long orderId,
            @RequestParam("status") String status);

    /**
     * Health check for order service
     * 
     * @return health status
     */
    @GetMapping("/api/orders/health")
    ResponseEntity<String> healthCheck();
}
