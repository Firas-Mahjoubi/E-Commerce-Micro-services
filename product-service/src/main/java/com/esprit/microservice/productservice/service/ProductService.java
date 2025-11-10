package com.esprit.microservice.productservice.service;

import com.esprit.microservice.productservice.client.InventoryClient;
import com.esprit.microservice.productservice.dto.InventoryResponse;
import com.esprit.microservice.productservice.dto.ProductRequest;
import com.esprit.microservice.productservice.dto.ProductResponse;
import com.esprit.microservice.productservice.event.ProductCreatedEvent;
import com.esprit.microservice.productservice.event.ProductDeletedEvent;
import com.esprit.microservice.productservice.event.ProductPlacedEvent;
import com.esprit.microservice.productservice.event.ProductUpdatedEvent;
import com.esprit.microservice.productservice.model.Product;
import com.esprit.microservice.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    private final ProductRepository productRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final InventoryClient inventoryClient;

    // CREATE - Create a new product
    public ProductResponse createProduct(ProductRequest productRequest) {
        Product product = Product.builder()
                .name(productRequest.getName())
                .description(productRequest.getDescription())
                .price(productRequest.getPrice())
                .skuCode(productRequest.getSkuCode())
                .category(productRequest.getCategory())
                .imageUrls(productRequest.getImageUrls())
                .stockQuantity(productRequest.getStockQuantity() != null ? productRequest.getStockQuantity() : 0)
                .active(productRequest.getActive() != null ? productRequest.getActive() : true)
                .sellerId(productRequest.getSellerId())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        product = productRepository.save(product);

        // Send Kafka event to create inventory (Asynchronous)
        ProductCreatedEvent createdEvent = ProductCreatedEvent.builder()
                .productId(product.getId())
                .skuCode(product.getSkuCode())
                .name(product.getName())
                .quantity(product.getStockQuantity())
                .sellerId(product.getSellerId())  // ✅ ADD THIS to event too
                .build();
        kafkaTemplate.send("product-created-topic", createdEvent);

        // Also send notification event
        kafkaTemplate.send("notificationTopic", new ProductPlacedEvent(product.getId()));        
        log.info("Product {} is created with skuCode {} by seller {}", product.getId(), product.getSkuCode(), product.getSellerId());
        return mapToProductResponse(product);
    }

    // READ - Get all products with inventory check (Synchronous with OpenFeign)
    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(this::mapToProductResponseWithInventory)
                .collect(Collectors.toList());
    }

    // READ - Get product by ID
    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return mapToProductResponseWithInventory(product);
    }

    // READ - Get products by category
    public List<ProductResponse> getProductsByCategory(String category) {
        List<Product> products = productRepository.findAll().stream()
                .filter(p -> p.getCategory() != null && p.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());
        return products.stream()
                .map(this::mapToProductResponseWithInventory)
                .collect(Collectors.toList());
    }

    // READ - Search products by name
    public List<ProductResponse> searchProductsByName(String name) {
        List<Product> products = productRepository.findAll().stream()
                .filter(p -> p.getName().toLowerCase().contains(name.toLowerCase()))
                .collect(Collectors.toList());
        return products.stream()
                .map(this::mapToProductResponseWithInventory)
                .collect(Collectors.toList());
    }

    // UPDATE - Update existing product
    public ProductResponse updateProduct(String id, ProductRequest productRequest) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        product.setName(productRequest.getName());
        product.setDescription(productRequest.getDescription());
        product.setPrice(productRequest.getPrice());
        product.setCategory(productRequest.getCategory());
        product.setImageUrls(productRequest.getImageUrls());
        product.setStockQuantity(productRequest.getStockQuantity());
        product.setActive(productRequest.getActive());
        if (productRequest.getSellerId() != null) {
            product.setSellerId(productRequest.getSellerId());
        }
        product.setUpdatedAt(LocalDateTime.now());
        
        product = productRepository.save(product);
        
        // Send Kafka event to update inventory (Asynchronous)
        ProductUpdatedEvent updatedEvent = ProductUpdatedEvent.builder()
                .productId(product.getId())
                .skuCode(product.getSkuCode())
                .name(product.getName())
                .quantity(product.getStockQuantity())
                .action("UPDATE")
                .build();
        kafkaTemplate.send("product-updated-topic", updatedEvent);
        
        log.info("Product {} is updated", product.getId());
        
        return mapToProductResponse(product);
    }

    // DELETE - Delete product
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        // Send Kafka event to delete inventory (Asynchronous)
        ProductDeletedEvent deletedEvent = ProductDeletedEvent.builder()
                .productId(product.getId())
                .skuCode(product.getSkuCode())
                .build();
        kafkaTemplate.send("product-deleted-topic", deletedEvent);
        
        productRepository.delete(product);
        
        log.info("Product {} is deleted", id);
    }
    public List<ProductResponse> getProductsBySeller(String sellerId) {
        List<Product> products = productRepository.findBySellerId(sellerId);
        return products.stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    // ADVANCED - Get active products only
    public List<ProductResponse> getActiveProducts() {
        List<Product> products = productRepository.findAll().stream()
                .filter(Product::getActive)
                .collect(Collectors.toList());
        return products.stream()
                .map(this::mapToProductResponseWithInventory)
                .collect(Collectors.toList());
    }

    // ADVANCED - Get products by price range
    public List<ProductResponse> getProductsByPriceRange(Double minPrice, Double maxPrice) {
        List<Product> products = productRepository.findAll().stream()
                .filter(p -> p.getPrice().doubleValue() >= minPrice && p.getPrice().doubleValue() <= maxPrice)
                .collect(Collectors.toList());
        return products.stream()
                .map(this::mapToProductResponseWithInventory)
                .collect(Collectors.toList());
    }

    // ADVANCED - Get low stock products
    public List<ProductResponse> getLowStockProducts(Integer threshold) {
        List<Product> products = productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() < threshold)
                .collect(Collectors.toList());
        return products.stream()
                .map(this::mapToProductResponseWithInventory)
                .collect(Collectors.toList());
    }

    // Helper method to map Product to ProductResponse with inventory check (OpenFeign - Synchronous)
    private ProductResponse mapToProductResponseWithInventory(Product product) {
        ProductResponse response = mapToProductResponse(product);
        
        // Call Inventory Service synchronously using OpenFeign
        try {
            List<InventoryResponse> inventoryResponses = inventoryClient.checkStock(
                    Collections.singletonList(product.getSkuCode())
            );
            if (!inventoryResponses.isEmpty()) {
                response.setInStock(inventoryResponses.get(0).getIsInStock());
            }
        } catch (Exception e) {
            log.error("Error checking inventory for product {}", product.getId(), e);
            response.setInStock(false);
        }
        
        return response;
    }

    // Helper method to map Product to ProductResponse
    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .skuCode(product.getSkuCode())
                .category(product.getCategory())
                .imageUrls(product.getImageUrls())
                .stockQuantity(product.getStockQuantity())
                .active(product.getActive())
                .sellerId(product.getSellerId())
                .inStock(false)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
