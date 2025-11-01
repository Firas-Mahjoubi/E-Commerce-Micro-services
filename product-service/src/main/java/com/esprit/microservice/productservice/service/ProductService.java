package com.esprit.microservice.productservice.service;

import com.esprit.microservice.productservice.dto.ProductRequest;
import com.esprit.microservice.productservice.dto.ProductResponse;
import com.esprit.microservice.productservice.event.ProductPlacedEvent;
import com.esprit.microservice.productservice.model.Product;
import com.esprit.microservice.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.kafka.core.KafkaTemplate;


import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    private final ProductRepository productRepository;
    private final KafkaTemplate<String,ProductPlacedEvent> kafkaTemplate;

    public void createProduct(ProductRequest productRequest) {
        Product product = Product.builder()
                .name(productRequest.getName())
                .description(productRequest.getDescription())
                .price(productRequest.getPrice())
                .build();
        productRepository.save(product);
        kafkaTemplate.send("notificationTopic", new ProductPlacedEvent(product.getId()));
        log.info("Product {} is saved", product.getId());

    }
    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream().map(this::mapToProductResponse).toList();
    }
    public ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .build();
    }
}
