package com.esprit.microservice.productservice.model;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Document(value = "product")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Product {
    @Id
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private String skuCode;
    private String category;
    private List<String> imageUrls;
    private Integer stockQuantity;
    private Boolean active;
    private String sellerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String sellerId;
}
