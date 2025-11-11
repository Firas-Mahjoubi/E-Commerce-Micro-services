package com.esprit.microservice.reviewservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewRequest {
    @NotBlank(message = "Product ID is required")
    private String productId;

    private String userId;
    
    private String userName;  // Nom de l'utilisateur depuis le token
    
    private String userEmail; // Email de l'utilisateur depuis le token

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must be less than 100 characters")
    private String title;

    @NotBlank(message = "Comment is required")
    @Size(max = 1000, message = "Comment must be less than 1000 characters")
    private String comment;

    @Builder.Default
    private Boolean verified = false;
}
