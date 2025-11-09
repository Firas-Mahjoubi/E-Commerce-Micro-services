package com.esprit.microservice.reviewservice.service;

import com.esprit.microservice.reviewservice.client.ProductClient;
import com.esprit.microservice.reviewservice.dto.ProductResponse;
import com.esprit.microservice.reviewservice.dto.ReviewRequest;
import com.esprit.microservice.reviewservice.dto.ReviewResponse;
import com.esprit.microservice.reviewservice.model.Review;
import com.esprit.microservice.reviewservice.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductClient productClient;

    // CREATE - Create a new review
    public ReviewResponse createReview(ReviewRequest reviewRequest) {
        // Validate product exists
        ProductResponse product;
        try {
            product = productClient.getProductById(reviewRequest.getProductId());
        } catch (Exception e) {
            log.error("Product not found with id: {}", reviewRequest.getProductId());
            throw new RuntimeException("Product not found");
        }

        // If userId is provided, check for duplicate reviews
        String userName = "Anonymous";
        if (reviewRequest.getUserId() != null && !reviewRequest.getUserId().isEmpty()) {
            // Check if user already reviewed this product
            List<Review> existingReviews = reviewRepository.findByProductId(reviewRequest.getProductId())
                    .stream()
                    .filter(r -> r.getUserId() != null && r.getUserId().equals(reviewRequest.getUserId()))
                    .collect(Collectors.toList());

            if (!existingReviews.isEmpty()) {
                throw new RuntimeException("User has already reviewed this product");
            }
            userName = "User"; // Simplified, since no user service call
        }

        Review review = Review.builder()
                .productId(reviewRequest.getProductId())
                .userId(reviewRequest.getUserId())
                .userName(userName)
                .rating(reviewRequest.getRating())
                .title(reviewRequest.getTitle())
                .comment(reviewRequest.getComment())
                .verified(reviewRequest.getVerified() != null ? reviewRequest.getVerified() : false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        review = reviewRepository.save(review);

        log.info("Review created for product {} by user {}", review.getProductId(), reviewRequest.getUserId() != null ? reviewRequest.getUserId() : "Anonymous");

        return mapToReviewResponse(review);
    }

    // READ - Get all reviews
    public List<ReviewResponse> getAllReviews() {
        List<Review> reviews = reviewRepository.findAll();
        return reviews.stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    // READ - Get review by ID
    public ReviewResponse getReviewById(String id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + id));
        return mapToReviewResponse(review);
    }

    // READ - Get reviews by product ID
    public List<ReviewResponse> getReviewsByProductId(String productId) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        return reviews.stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    // READ - Get reviews by user ID
    public List<ReviewResponse> getReviewsByUserId(String userId) {
        List<Review> reviews = reviewRepository.findByUserId(userId);
        return reviews.stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    // READ - Get verified reviews by product ID
    public List<ReviewResponse> getVerifiedReviewsByProductId(String productId) {
        List<Review> reviews = reviewRepository.findByProductIdAndVerified(productId, true);
        return reviews.stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    // UPDATE - Update review
    public ReviewResponse updateReview(String id, ReviewRequest reviewRequest) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + id));

        // Only allow the original user to update their review
        if (review.getUserId() != null && !review.getUserId().equals(reviewRequest.getUserId())) {
            throw new RuntimeException("Unauthorized to update this review");
        }

        review.setRating(reviewRequest.getRating());
        review.setTitle(reviewRequest.getTitle());
        review.setComment(reviewRequest.getComment());
        review.setVerified(reviewRequest.getVerified() != null ? reviewRequest.getVerified() : review.getVerified());
        review.setUpdatedAt(LocalDateTime.now());

        review = reviewRepository.save(review);

        log.info("Review {} updated", review.getId());

        return mapToReviewResponse(review);
    }

    // UPDATE - Update anonymous review
    public ReviewResponse updateReviewAnonymous(String id, ReviewRequest reviewRequest) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + id));

        // Allow update for anonymous reviews (userId is null)
        review.setRating(reviewRequest.getRating());
        review.setTitle(reviewRequest.getTitle());
        review.setComment(reviewRequest.getComment());
        review.setVerified(reviewRequest.getVerified() != null ? reviewRequest.getVerified() : review.getVerified());
        review.setUpdatedAt(LocalDateTime.now());

        review = reviewRepository.save(review);

        log.info("Anonymous review {} updated", review.getId());

        return mapToReviewResponse(review);
    }

    // DELETE - Delete review
    public void deleteReview(String id, String userId) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + id));

        // Only allow the original user or admin to delete
        if (review.getUserId() != null && !review.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this review");
        }

        reviewRepository.delete(review);

        log.info("Review {} deleted", id);
    }

    // DELETE - Delete anonymous review
    public void deleteReviewAnonymous(String id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + id));

        // Allow deletion for anonymous reviews (userId is null)
        reviewRepository.delete(review);

        log.info("Anonymous review {} deleted", id);
    }

    // ADVANCED - Get average rating for product
    public Double getAverageRatingForProduct(String productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        return reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
    }

    // ADVANCED - Get rating distribution for product
    public java.util.Map<Integer, Long> getRatingDistribution(String productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        return reviews.stream()
                .collect(Collectors.groupingBy(Review::getRating, Collectors.counting()));
    }

    // Helper method to map Review to ReviewResponse
    private ReviewResponse mapToReviewResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProductId())
                .userId(review.getUserId())
                .userName(review.getUserName())
                .rating(review.getRating())
                .title(review.getTitle())
                .comment(review.getComment())
                .verified(review.getVerified())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
