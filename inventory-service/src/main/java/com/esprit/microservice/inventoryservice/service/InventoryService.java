package com.esprit.microservice.inventoryservice.service;


import com.esprit.microservice.inventoryservice.dto.InventoryRequest;
import com.esprit.microservice.inventoryservice.dto.InventoryResponse;
import com.esprit.microservice.inventoryservice.event.InventoryCreatedEvent;
import com.esprit.microservice.inventoryservice.event.InventoryUpdatedEvent;
import com.esprit.microservice.inventoryservice.model.Inventory;
import com.esprit.microservice.inventoryservice.repository.InventoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    // CHECK STOCK - Original method (Synchronous call from Product Service via OpenFeign)
    @Transactional
    public List<InventoryResponse> isInStock(List<String> skuCode) {
        return inventoryRepository.findBySkuCodeIn(skuCode).stream().map(inventory ->
                InventoryResponse.builder()
                        .skuCode(inventory.getSkuCode())
                        .isInStock(inventory.getQuantity() > 0)
                        .availableQuantity(inventory.getQuantity())
                        .build()
        ).toList();
    }

    // CREATE - Create new inventory
    @Transactional
    public InventoryResponse createInventory(InventoryRequest request) {
        Inventory inventory = new Inventory();
        inventory.setSkuCode(request.getSkuCode());
        inventory.setQuantity(request.getQuantity() != null ? request.getQuantity() : 0);
        
        inventory = inventoryRepository.save(inventory);
        
        // Send Kafka event (Asynchronous)
        InventoryCreatedEvent event = InventoryCreatedEvent.builder()
                .skuCode(inventory.getSkuCode())
                .quantity(inventory.getQuantity())
                .build();
        kafkaTemplate.send("inventory-created-topic", event);
        
        log.info("Inventory created for skuCode: {}", inventory.getSkuCode());
        
        return mapToInventoryResponse(inventory);
    }

    // READ - Get all inventory
    public List<InventoryResponse> getAllInventory() {
        return inventoryRepository.findAll().stream()
                .map(this::mapToInventoryResponse)
                .collect(Collectors.toList());
    }

    // READ - Get inventory by skuCode
    public InventoryResponse getInventoryBySkuCode(String skuCode) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new RuntimeException("Inventory not found for skuCode: " + skuCode));
        return mapToInventoryResponse(inventory);
    }

    // UPDATE - Update inventory quantity
    @Transactional
    public InventoryResponse updateInventory(String skuCode, InventoryRequest request) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new RuntimeException("Inventory not found for skuCode: " + skuCode));
        
        inventory.setQuantity(request.getQuantity());
        inventory = inventoryRepository.save(inventory);
        
        // Send Kafka event (Asynchronous)
        InventoryUpdatedEvent event = InventoryUpdatedEvent.builder()
                .skuCode(inventory.getSkuCode())
                .quantity(inventory.getQuantity())
                .action("UPDATE")
                .build();
        kafkaTemplate.send("inventory-updated-topic", event);
        
        log.info("Inventory updated for skuCode: {}", skuCode);
        
        return mapToInventoryResponse(inventory);
    }

    // DELETE - Delete inventory
    @Transactional
    public void deleteInventory(String skuCode) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new RuntimeException("Inventory not found for skuCode: " + skuCode));
        
        inventoryRepository.delete(inventory);
        log.info("Inventory deleted for skuCode: {}", skuCode);
    }

    // ADVANCED - Increase stock
    @Transactional
    public InventoryResponse increaseStock(String skuCode, Integer quantity) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new RuntimeException("Inventory not found for skuCode: " + skuCode));
        
        inventory.setQuantity(inventory.getQuantity() + quantity);
        inventory = inventoryRepository.save(inventory);
        
        // Send Kafka event (Asynchronous)
        InventoryUpdatedEvent event = InventoryUpdatedEvent.builder()
                .skuCode(inventory.getSkuCode())
                .quantity(quantity)
                .action("INCREASE")
                .build();
        kafkaTemplate.send("inventory-updated-topic", event);
        
        log.info("Increased stock for skuCode: {} by {}", skuCode, quantity);
        
        return mapToInventoryResponse(inventory);
    }

    // ADVANCED - Decrease stock
    @Transactional
    public InventoryResponse decreaseStock(String skuCode, Integer quantity) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new RuntimeException("Inventory not found for skuCode: " + skuCode));
        
        if (inventory.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock for skuCode: " + skuCode);
        }
        
        inventory.setQuantity(inventory.getQuantity() - quantity);
        inventory = inventoryRepository.save(inventory);
        
        // Send Kafka event (Asynchronous)
        InventoryUpdatedEvent event = InventoryUpdatedEvent.builder()
                .skuCode(inventory.getSkuCode())
                .quantity(quantity)
                .action("DECREASE")
                .build();
        kafkaTemplate.send("inventory-updated-topic", event);
        
        log.info("Decreased stock for skuCode: {} by {}", skuCode, quantity);
        
        return mapToInventoryResponse(inventory);
    }

    // ADVANCED - Get low stock items
    public List<InventoryResponse> getLowStockItems(Integer threshold) {
        return inventoryRepository.findAll().stream()
                .filter(inventory -> inventory.getQuantity() < threshold)
                .map(this::mapToInventoryResponse)
                .collect(Collectors.toList());
    }

    // ADVANCED - Get out of stock items
    public List<InventoryResponse> getOutOfStockItems() {
        return inventoryRepository.findAll().stream()
                .filter(inventory -> inventory.getQuantity() == 0)
                .map(this::mapToInventoryResponse)
                .collect(Collectors.toList());
    }

    // Helper method to map Inventory to InventoryResponse
    private InventoryResponse mapToInventoryResponse(Inventory inventory) {
        return InventoryResponse.builder()
                .skuCode(inventory.getSkuCode())
                .isInStock(inventory.getQuantity() > 0)
                .availableQuantity(inventory.getQuantity())
                .build();
    }
}
