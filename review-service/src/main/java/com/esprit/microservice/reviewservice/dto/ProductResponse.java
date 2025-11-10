package com.esprit.microservice.reviewservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponse {
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private String skuCode;
    private String category;
    private List<String> imageUrls;
    private Integer stockQuantity;
    private Boolean active;
    private Boolean inStock;
    private String sellerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
