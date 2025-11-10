package com.esprit.microservice.reviewservice.repository;

import com.esprit.microservice.reviewservice.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByProductId(String productId);
    List<Review> findByUserId(String userId);
    List<Review> findByProductIdAndVerified(String productId, Boolean verified);
    List<Review> findByRating(Integer rating);
    List<Review> findByProductIdOrderByCreatedAtDesc(String productId);
    List<Review> findByProductIdAndRatingBetween(String productId, Integer minRating, Integer maxRating);
    List<Review> findByVerifiedOrderByCreatedAtDesc(Boolean verified);
    List<Review> findByCreatedAtBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
    long countByProductId(String productId);
    long countByProductIdAndRating(String productId, Integer rating);
    List<Review> findByProductIdIn(List<String> productIds);
}
