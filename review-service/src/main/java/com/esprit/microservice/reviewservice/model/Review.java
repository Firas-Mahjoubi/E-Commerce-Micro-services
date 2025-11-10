package com.esprit.microservice.reviewservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "review")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String productId;
    private String userId;
    private String userName;
    private String userEmail;  // Email de l'utilisateur
    private Integer rating; // 1-5 stars
    private String title;
    private String comment;
    @Column(name = "approved", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean verified; // true if user actually purchased the product
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
