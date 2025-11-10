package com.esprit.microservice.reviewservice.controller;

import com.esprit.microservice.reviewservice.dto.ReviewRequest;
import com.esprit.microservice.reviewservice.dto.ReviewResponse;
import com.esprit.microservice.reviewservice.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewService reviewService;

    // CREATE - Create a new review
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ReviewResponse> createReview(@Valid @RequestBody ReviewRequest reviewRequest) {
        ReviewResponse response = reviewService.createReview(reviewRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // READ - Get all reviews
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    // READ - Get review by ID
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<ReviewResponse> getReviewById(@PathVariable String id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    // READ - Get reviews by product ID
    @GetMapping("/product/{productId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<ReviewResponse>> getReviewsByProductId(@PathVariable String productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProductId(productId));
    }

    // READ - Get reviews by user ID
    @GetMapping("/user/{userId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<ReviewResponse>> getReviewsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(reviewService.getReviewsByUserId(userId));
    }

    // READ - Get verified reviews by product ID
    @GetMapping("/product/{productId}/verified")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<ReviewResponse>> getVerifiedReviewsByProductId(@PathVariable String productId) {
        return ResponseEntity.ok(reviewService.getVerifiedReviewsByProductId(productId));
    }

    // UPDATE - Update review
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable String id,
            @Valid @RequestBody ReviewRequest reviewRequest) {
        // For anonymous reviews, allow update without userId validation
        if (reviewRequest.getUserId() == null || reviewRequest.getUserId().isEmpty()) {
            return ResponseEntity.ok(reviewService.updateReviewAnonymous(id, reviewRequest));
        }
        return ResponseEntity.ok(reviewService.updateReview(id, reviewRequest));
    }

    // DELETE - Delete review
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteReview(@PathVariable String id, @RequestParam(required = false) String userId) {
        // For anonymous reviews, allow deletion without userId
        if (userId == null || userId.isEmpty()) {
            reviewService.deleteReviewAnonymous(id);
        } else {
            reviewService.deleteReview(id, userId);
        }
        return ResponseEntity.noContent().build();
    }

    // ADVANCED - Get average rating for product
    @GetMapping("/product/{productId}/average-rating")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Double> getAverageRatingForProduct(@PathVariable String productId) {
        return ResponseEntity.ok(reviewService.getAverageRatingForProduct(productId));
    }

    // ADVANCED - Get rating distribution for product
    @GetMapping("/product/{productId}/rating-distribution")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Map<Integer, Long>> getRatingDistribution(@PathVariable String productId) {
        return ResponseEntity.ok(reviewService.getRatingDistribution(productId));
    }

    // ADVANCED - Get reviews by rating range for product
    @GetMapping("/product/{productId}/rating-range")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<ReviewResponse>> getReviewsByRatingRange(
            @PathVariable String productId,
            @RequestParam Integer minRating,
            @RequestParam Integer maxRating) {
        return ResponseEntity.ok(reviewService.getReviewsByRatingRange(productId, minRating, maxRating));
    }

    // ADVANCED - Get recent verified reviews
    @GetMapping("/recent-verified")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<ReviewResponse>> getRecentVerifiedReviews(
            @RequestParam(defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(reviewService.getRecentVerifiedReviews(limit));
    }

    // ADVANCED - Get reviews within date range
    @GetMapping("/date-range")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<ReviewResponse>> getReviewsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        java.time.LocalDateTime start = java.time.LocalDateTime.parse(startDate);
        java.time.LocalDateTime end = java.time.LocalDateTime.parse(endDate);
        return ResponseEntity.ok(reviewService.getReviewsByDateRange(start, end));
    }

    // ADVANCED - Get review statistics for product
    @GetMapping("/product/{productId}/statistics")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Map<String, Object>> getReviewStatistics(@PathVariable String productId) {
        return ResponseEntity.ok(reviewService.getReviewStatistics(productId));
    }

    // ADVANCED - Search reviews by keyword
    @GetMapping("/search")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<ReviewResponse>> searchReviews(@RequestParam String keyword) {
        return ResponseEntity.ok(reviewService.searchReviews(keyword));
    }

    // ADVANCED - Get top rated products
    @GetMapping("/top-rated-products")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<Map<String, Object>>> getTopRatedProducts(
            @RequestParam(defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(reviewService.getTopRatedProducts(limit));
    }

    // SELLER DASHBOARD - Get seller's review statistics
    @GetMapping("/seller/{sellerId}/statistics")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Map<String, Object>> getSellerReviewStatistics(@PathVariable String sellerId) {
        return ResponseEntity.ok(reviewService.getSellerReviewStatistics(sellerId));
    }

    // SELLER DASHBOARD - Get seller's product reviews with pagination
    @GetMapping("/seller/{sellerId}/reviews")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<ReviewResponse>> getSellerProductReviews(
            @PathVariable String sellerId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        return ResponseEntity.ok(reviewService.getSellerProductReviews(sellerId, page, size));
    }

    // SELLER DASHBOARD - Get seller's review trends (last 30 days)
    @GetMapping("/seller/{sellerId}/trends")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Map<String, Object>> getSellerReviewTrends(@PathVariable String sellerId) {
        return ResponseEntity.ok(reviewService.getSellerReviewTrends(sellerId));
    }


}
