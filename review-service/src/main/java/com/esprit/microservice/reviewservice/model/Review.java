package com.esprit.microservice.reviewservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(value = "review")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Review {
    @Id
    private String id;
    private String productId;
    private String userId;
    private String userName;
    private Integer rating; // 1-5 stars
    private String title;
    private String comment;
    private Boolean verified; // true if user actually purchased the product
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
