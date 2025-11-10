package tn.esprit.spring.orderservice.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.spring.orderservice.dto.CreateOrderRequest;
import tn.esprit.spring.orderservice.dto.OrderResponse;
import tn.esprit.spring.orderservice.service.OrderService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);
    
    private final OrderService orderService;

    // Constructeur pour injection de dépendance
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Créer une nouvelle commande
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request, HttpServletRequest httpRequest) {
        try {
            // ✅ Extract customer ID from JWT token
            String customerId = extractCustomerIdFromToken(httpRequest);
            request.setCustomerId(customerId);

            log.info("Received request to create order for customer: {}", customerId);
            OrderResponse orderResponse = orderService.createOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(orderResponse);
        } catch (RuntimeException e) {
            log.error("Error creating order: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error creating order: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupérer toutes les commandes d'un client
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByCustomer(@PathVariable String customerId) {
        try {
            log.info("Fetching orders for customer: {}", customerId);
            List<OrderResponse> orders = orderService.getOrdersByCustomerId(customerId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Error fetching orders for customer {}: {}", customerId, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Récupérer une commande par ID
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long orderId) {
        try {
            log.info("Fetching order with ID: {}", orderId);
            OrderResponse order = orderService.getOrderById(orderId);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            log.error("Order not found: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            log.error("Error fetching order {}: {}", orderId, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Récupérer une commande par ID pour un client spécifique (sécurisé)
     */
    @GetMapping("/{orderId}/customer/{customerId}")
    public ResponseEntity<OrderResponse> getOrderByIdAndCustomer(
            @PathVariable Long orderId,
            @PathVariable String customerId) {
        try {
            log.info("Fetching order {} for customer: {}", orderId, customerId);
            OrderResponse order = orderService.getOrderByIdAndCustomerId(orderId, customerId);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            log.error("Order not found: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            log.error("Error fetching order {} for customer {}: {}", orderId, customerId, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Mettre à jour le statut d'une commande
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        try {
            log.info("Updating status for order {} to: {}", orderId, status);
            OrderResponse order = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            log.error("Error updating order status: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            log.error("Error updating order {} status: {}", orderId, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Annuler une commande
     */
    @PutMapping("/{orderId}/cancel/customer/{customerId}")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long orderId,
            @PathVariable String customerId) {
        try {
            log.info("Cancelling order {} for customer: {}", orderId, customerId);
            OrderResponse order = orderService.cancelOrder(orderId, customerId);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            log.error("Error cancelling order: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            log.error("Error cancelling order {} for customer {}: {}", orderId, customerId, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Order Service is running!");
    }

    // ✅ JWT extraction methods
    private String extractCustomerIdFromToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header missing or invalid");
        }
        String token = authHeader.substring(7);
        return extractSubFromJWT(token);
    }

    private String extractSubFromJWT(String token) {
        try {
            String[] chunks = token.split("\\.");
            if (chunks.length != 3) {
                throw new RuntimeException("Invalid JWT token format");
            }
            Base64.Decoder decoder = Base64.getUrlDecoder();
            String payload = new String(decoder.decode(chunks[1]));
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(payload);
            String sub = jsonNode.get("sub").asText();
            if (sub == null || sub.isEmpty()) {
                throw new RuntimeException("Customer ID (sub) not found in token");
            }
            return sub;
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract customer ID from token: " + e.getMessage());
        }
    }
}