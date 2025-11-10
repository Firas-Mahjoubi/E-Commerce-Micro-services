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
public class ReviewResponse {
    private Long id;
    private ProductInfo product;
    private String userId;
    private String userName;
    private Integer rating;
    private String title;
    private String comment;
    private Boolean verified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductInfo {
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
}
