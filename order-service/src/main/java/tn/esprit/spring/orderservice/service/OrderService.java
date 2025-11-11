package tn.esprit.spring.orderservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.spring.orderservice.dto.CreateOrderRequest;
import tn.esprit.spring.orderservice.dto.OrderResponse;
import tn.esprit.spring.orderservice.entity.Order;
import tn.esprit.spring.orderservice.entity.OrderItem;
import tn.esprit.spring.orderservice.repository.OrderRepository;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;

    // Constructeur pour injection de dépendance
    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Créer une nouvelle commande
     */
    public OrderResponse createOrder(CreateOrderRequest request) {
        log.info("Creating order for customer: {}", request.getCustomerId());

        // Créer l'entité Order
        Order order = new Order();
        order.setCustomerId(request.getCustomerId());

        // Créer les OrderItems
        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0.0;

        for (CreateOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(itemRequest.getProductId());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(itemRequest.getPrice());

            orderItems.add(orderItem);
            totalAmount += orderItem.getTotalPrice();
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);

        // Sauvegarder la commande
        Order savedOrder = orderRepository.save(order);
        log.info("Order created successfully with ID: {}", savedOrder.getId());

        return mapToOrderResponse(savedOrder);
    }

    /**
     * Récupérer toutes les commandes d'un client
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByCustomerId(String customerId) {
        log.info("Fetching orders for customer: {}", customerId);
        
        List<Order> orders = orderRepository.findByCustomerId(customerId);
        return orders.stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    /**
     * Récupérer une commande par ID
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        log.info("Fetching order with ID: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        
        return mapToOrderResponse(order);
    }

    /**
     * Récupérer une commande par ID et customer ID (sécurisé)
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdAndCustomerId(Long orderId, String customerId) {
        log.info("Fetching order with ID: {} for customer: {}", orderId, customerId);
        
        Order order = orderRepository.findByIdAndCustomerId(orderId, customerId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId + " for customer: " + customerId));
        
        return mapToOrderResponse(order);
    }

    /**
     * Mettre à jour le statut d'une commande
     */
    public OrderResponse updateOrderStatus(Long orderId, String newStatus) {
        log.info("Updating order status for order: {} to status: {}", orderId, newStatus);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        
        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        
        log.info("Order status updated successfully");
        return mapToOrderResponse(updatedOrder);
    }

    /**
     * Annuler une commande
     */
    public OrderResponse cancelOrder(Long orderId, String customerId) {
        log.info("Cancelling order: {} for customer: {}", orderId, customerId);
        
        Order order = orderRepository.findByIdAndCustomerId(orderId, customerId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId + " for customer: " + customerId));
        
        if (!"PENDING".equals(order.getStatus())) {
            throw new RuntimeException("Cannot cancel order with status: " + order.getStatus());
        }
        
        order.setStatus("CANCELLED");
        Order cancelledOrder = orderRepository.save(order);
        
        log.info("Order cancelled successfully");
        return mapToOrderResponse(cancelledOrder);
    }

    /**
     * Mapper une entité Order vers OrderResponse
     */
    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setCustomerId(order.getCustomerId());
        response.setOrderDate(order.getOrderDate());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());

        List<OrderResponse.OrderItemResponse> itemResponses = new ArrayList<>();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                OrderResponse.OrderItemResponse itemResponse = new OrderResponse.OrderItemResponse();
                itemResponse.setId(item.getId());
                itemResponse.setProductId(item.getProductId());
                itemResponse.setQuantity(item.getQuantity());
                itemResponse.setPrice(item.getPrice());
                itemResponse.setTotalPrice(item.getTotalPrice());
                itemResponses.add(itemResponse);
            }
        }
        response.setItems(itemResponses);

        return response;
    }
}