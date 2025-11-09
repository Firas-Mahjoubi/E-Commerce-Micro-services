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


}
