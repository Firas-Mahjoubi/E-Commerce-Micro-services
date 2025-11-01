package com.esprit.microservice.inventoryservice.listener;

import com.esprit.microservice.inventoryservice.model.Inventory;
import com.esprit.microservice.inventoryservice.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductEventListener {

    private final InventoryRepository inventoryRepository;

    @KafkaListener(topics = "product-created-topic", groupId = "inventory-group", autoStartup = "${kafka.listener.auto-startup:true}")
    public void handleProductCreated(Map<String, Object> event) {
        log.info("Received ProductCreatedEvent: {}", event);
        try {
            String skuCode = (String) event.get("skuCode");
            Integer quantity = (Integer) event.get("quantity");
            
            // Create inventory entry for new product
            Inventory inventory = new Inventory();
            inventory.setSkuCode(skuCode);
            inventory.setQuantity(quantity != null ? quantity : 0);
            inventoryRepository.save(inventory);
            
            log.info("Created inventory for product with skuCode: {}", skuCode);
        } catch (Exception e) {
            log.error("Error processing ProductCreatedEvent", e);
        }
    }

    @KafkaListener(topics = "product-updated-topic", groupId = "inventory-group", autoStartup = "${kafka.listener.auto-startup:true}")
    public void handleProductUpdated(Map<String, Object> event) {
        log.info("Received ProductUpdatedEvent: {}", event);
        try {
            String skuCode = (String) event.get("skuCode");
            Integer quantity = (Integer) event.get("quantity");
            
            inventoryRepository.findBySkuCode(skuCode).ifPresent(inventory -> {
                if (quantity != null) {
                    inventory.setQuantity(quantity);
                    inventoryRepository.save(inventory);
                    log.info("Updated inventory for skuCode: {}", skuCode);
                }
            });
        } catch (Exception e) {
            log.error("Error processing ProductUpdatedEvent", e);
        }
    }

    @KafkaListener(topics = "product-deleted-topic", groupId = "inventory-group", autoStartup = "${kafka.listener.auto-startup:true}")
    public void handleProductDeleted(Map<String, Object> event) {
        log.info("Received ProductDeletedEvent: {}", event);
        try {
            String skuCode = (String) event.get("skuCode");
            
            inventoryRepository.findBySkuCode(skuCode).ifPresent(inventory -> {
                inventoryRepository.delete(inventory);
                log.info("Deleted inventory for skuCode: {}", skuCode);
            });
        } catch (Exception e) {
            log.error("Error processing ProductDeletedEvent", e);
        }
    }
}
