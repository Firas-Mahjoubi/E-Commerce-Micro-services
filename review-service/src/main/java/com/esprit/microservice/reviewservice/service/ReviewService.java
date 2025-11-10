package com.esprit.microservice.reviewservice.service;

import com.esprit.microservice.reviewservice.client.ProductClient;
import com.esprit.microservice.reviewservice.client.UserClient;
import com.esprit.microservice.reviewservice.dto.ProductResponse;
import com.esprit.microservice.reviewservice.dto.ReviewRequest;
import com.esprit.microservice.reviewservice.dto.ReviewResponse;
import com.esprit.microservice.reviewservice.dto.UserResponse;
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
    private final UserClient userClient;

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

        // If userId is provided, check for duplicate reviews and fetch user info
        String userName = "Anonymous";
        if (reviewRequest.getUserId() != null && !reviewRequest.getUserId().isEmpty()) {
            // Fetch user info from user-service
            UserResponse user;
            try {
                user = userClient.getUserById(reviewRequest.getUserId());
                userName = user.getFirstName() + " " + user.getLastName();
            } catch (Exception e) {
                log.warn("User not found with id: {}, using Anonymous", reviewRequest.getUserId());
                // Don't throw exception, just use Anonymous
                userName = "Anonymous";
            }

            // Check if user already reviewed this product
            List<Review> existingReviews = reviewRepository.findByProductId(reviewRequest.getProductId())
                    .stream()
                    .filter(r -> r.getUserId() != null && r.getUserId().equals(reviewRequest.getUserId()))
                    .collect(Collectors.toList());

            if (!existingReviews.isEmpty()) {
                throw new RuntimeException("User has already reviewed this product");
            }
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
                .map(this::mapToReviewResponseWithProduct)
                .collect(Collectors.toList());
    }

    // READ - Get review by ID
    public ReviewResponse getReviewById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + id));
        return mapToReviewResponseWithProduct(review);
    }

    // READ - Get reviews by product ID
    public List<ReviewResponse> getReviewsByProductId(String productId) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        return reviews.stream()
                .map(this::mapToReviewResponseWithProduct)
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
    public ReviewResponse updateReview(Long id, ReviewRequest reviewRequest) {
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
    public ReviewResponse updateReviewAnonymous(Long id, ReviewRequest reviewRequest) {
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
    public void deleteReview(Long id, String userId) {
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
    public void deleteReviewAnonymous(Long id) {
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

    // ADVANCED - Get reviews by rating range for product
    public List<ReviewResponse> getReviewsByRatingRange(String productId, Integer minRating, Integer maxRating) {
        List<Review> reviews = reviewRepository.findByProductIdAndRatingBetween(productId, minRating, maxRating);
        return reviews.stream()
                .map(this::mapToReviewResponseWithProduct)
                .collect(Collectors.toList());
    }

    // ADVANCED - Get recent verified reviews
    public List<ReviewResponse> getRecentVerifiedReviews(Integer limit) {
        List<Review> reviews = reviewRepository.findByVerifiedOrderByCreatedAtDesc(true);
        return reviews.stream()
                .limit(limit != null ? limit : 10)
                .map(this::mapToReviewResponseWithProduct)
                .collect(Collectors.toList());
    }

    // ADVANCED - Get reviews within date range
    public List<ReviewResponse> getReviewsByDateRange(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate) {
        List<Review> reviews = reviewRepository.findByCreatedAtBetween(startDate, endDate);
        return reviews.stream()
                .map(this::mapToReviewResponseWithProduct)
                .collect(Collectors.toList());
    }

    // ADVANCED - Get review statistics for product
    public java.util.Map<String, Object> getReviewStatistics(String productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        java.util.Map<String, Object> stats = new java.util.HashMap<>();

        if (reviews.isEmpty()) {
            stats.put("totalReviews", 0);
            stats.put("averageRating", 0.0);
            stats.put("verifiedReviews", 0);
            stats.put("ratingDistribution", new java.util.HashMap<>());
            return stats;
        }

        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        long verifiedCount = reviews.stream()
                .filter(Review::getVerified)
                .count();

        java.util.Map<Integer, Long> ratingDistribution = reviews.stream()
                .collect(Collectors.groupingBy(Review::getRating, Collectors.counting()));

        stats.put("totalReviews", reviews.size());
        stats.put("averageRating", Math.round(averageRating * 10.0) / 10.0);
        stats.put("verifiedReviews", verifiedCount);
        stats.put("ratingDistribution", ratingDistribution);

        return stats;
    }

    // ADVANCED - Search reviews by keyword
    public List<ReviewResponse> searchReviews(String keyword) {
        List<Review> allReviews = reviewRepository.findAll();
        return allReviews.stream()
                .filter(review ->
                    (review.getTitle() != null && review.getTitle().toLowerCase().contains(keyword.toLowerCase())) ||
                    (review.getComment() != null && review.getComment().toLowerCase().contains(keyword.toLowerCase()))
                )
                .map(this::mapToReviewResponseWithProduct)
                .collect(Collectors.toList());
    }

    // ADVANCED - Get top rated products based on reviews
    public List<java.util.Map<String, Object>> getTopRatedProducts(Integer limit) {
        List<Review> allReviews = reviewRepository.findAll();

        // Group by productId and calculate average rating
        java.util.Map<String, java.util.List<Review>> reviewsByProduct = allReviews.stream()
                .collect(Collectors.groupingBy(Review::getProductId));

        return reviewsByProduct.entrySet().stream()
                .map(entry -> {
                    String productId = entry.getKey();
                    List<Review> productReviews = entry.getValue();

                    double averageRating = productReviews.stream()
                            .mapToInt(Review::getRating)
                            .average()
                            .orElse(0.0);

                    long totalReviews = productReviews.size();

                    java.util.Map<String, Object> productStats = new java.util.HashMap<>();
                    productStats.put("productId", productId);
                    productStats.put("averageRating", Math.round(averageRating * 10.0) / 10.0);
                    productStats.put("totalReviews", totalReviews);

                    return productStats;
                })
                .sorted((a, b) -> Double.compare((Double) b.get("averageRating"), (Double) a.get("averageRating")))
                .limit(limit != null ? limit : 10)
                .collect(Collectors.toList());
    }

    // SELLER DASHBOARD - Get seller's products review statistics
    public java.util.Map<String, Object> getSellerReviewStatistics(String sellerId) {
        // First, get all products by seller (this would need product service call)
        // For now, we'll get all reviews and filter by sellerId from product info
        List<Review> allReviews = reviewRepository.findAll();

        java.util.Map<String, Object> sellerStats = new java.util.HashMap<>();
        java.util.Map<String, java.util.List<Review>> reviewsByProduct = new java.util.HashMap<>();
        int totalProducts = 0;
        int totalReviews = 0;
        double totalRatingSum = 0.0;

        for (Review review : allReviews) {
            try {
                ProductResponse product = productClient.getProductById(review.getProductId());
                if (product.getSellerId() != null && product.getSellerId().equals(sellerId)) {
                    reviewsByProduct.computeIfAbsent(review.getProductId(), k -> new java.util.ArrayList<>()).add(review);
                    totalReviews++;
                    totalRatingSum += review.getRating();
                }
            } catch (Exception e) {
                log.warn("Could not fetch product info for review {}", review.getId());
            }
        }

        totalProducts = reviewsByProduct.size();
        double averageRating = totalReviews > 0 ? totalRatingSum / totalReviews : 0.0;

        // Get top 5 products by rating
        List<java.util.Map<String, Object>> topProducts = reviewsByProduct.entrySet().stream()
                .map(entry -> {
                    String productId = entry.getKey();
                    List<Review> productReviews = entry.getValue();

                    double productAverageRating = productReviews.stream()
                            .mapToInt(Review::getRating)
                            .average()
                            .orElse(0.0);

                    java.util.Map<String, Object> productStats = new java.util.HashMap<>();
                    productStats.put("productId", productId);
                    productStats.put("averageRating", Math.round(productAverageRating * 10.0) / 10.0);
                    productStats.put("totalReviews", productReviews.size());

                    return productStats;
                })
                .sorted((a, b) -> Double.compare((Double) b.get("averageRating"), (Double) a.get("averageRating")))
                .limit(5)
                .collect(Collectors.toList());

        sellerStats.put("totalProducts", totalProducts);
        sellerStats.put("totalReviews", totalReviews);
        sellerStats.put("averageRating", Math.round(averageRating * 10.0) / 10.0);
        sellerStats.put("topProducts", topProducts);

        return sellerStats;
    }

    // SELLER DASHBOARD - Get reviews for seller's products
    public List<ReviewResponse> getSellerProductReviews(String sellerId, Integer page, Integer size) {
        List<Review> allReviews = reviewRepository.findAll();
        List<ReviewResponse> sellerReviews = new java.util.ArrayList<>();

        for (Review review : allReviews) {
            try {
                ProductResponse product = productClient.getProductById(review.getProductId());
                if (product.getSellerId() != null && product.getSellerId().equals(sellerId)) {
                    sellerReviews.add(mapToReviewResponseWithProduct(review));
                }
            } catch (Exception e) {
                log.warn("Could not fetch product info for review {}", review.getId());
            }
        }

        // Simple pagination
        int startIndex = (page != null && size != null) ? page * size : 0;
        int endIndex = (size != null) ? startIndex + size : sellerReviews.size();

        if (startIndex >= sellerReviews.size()) {
            return new java.util.ArrayList<>();
        }

        endIndex = Math.min(endIndex, sellerReviews.size());
        return sellerReviews.subList(startIndex, endIndex);
    }

    // SELLER DASHBOARD - Get review trends for seller (last 30 days)
    public java.util.Map<String, Object> getSellerReviewTrends(String sellerId) {
        java.time.LocalDateTime thirtyDaysAgo = java.time.LocalDateTime.now().minusDays(30);
        List<Review> recentReviews = reviewRepository.findByCreatedAtBetween(thirtyDaysAgo, java.time.LocalDateTime.now());

        java.util.Map<String, Object> trends = new java.util.HashMap<>();
        java.util.Map<String, Integer> dailyReviewCount = new java.util.HashMap<>();
        java.util.Map<String, Double> dailyAverageRating = new java.util.HashMap<>();

        for (Review review : recentReviews) {
            try {
                ProductResponse product = productClient.getProductById(review.getProductId());
                if (product.getSellerId() != null && product.getSellerId().equals(sellerId)) {
                    String dateKey = review.getCreatedAt().toLocalDate().toString();

                    dailyReviewCount.put(dateKey, dailyReviewCount.getOrDefault(dateKey, 0) + 1);

                    double currentAvg = dailyAverageRating.getOrDefault(dateKey, 0.0);
                    int currentCount = dailyReviewCount.get(dateKey);
                    double newAvg = (currentAvg * (currentCount - 1) + review.getRating()) / currentCount;
                    dailyAverageRating.put(dateKey, newAvg);
                }
            } catch (Exception e) {
                log.warn("Could not fetch product info for review {}", review.getId());
            }
        }

        trends.put("dailyReviewCount", dailyReviewCount);
        trends.put("dailyAverageRating", dailyAverageRating);
        trends.put("totalReviewsLast30Days", recentReviews.size());

        return trends;
    }

    // Helper method to map Review to ReviewResponse
    private ReviewResponse mapToReviewResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
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

    // Helper method to map Review to ReviewResponse with full product info
    private ReviewResponse mapToReviewResponseWithProduct(Review review) {
        ReviewResponse response = mapToReviewResponse(review);

        // Fetch full product information using Feign Client
        try {
            ProductResponse product = productClient.getProductById(review.getProductId());
            ReviewResponse.ProductInfo productInfo = ReviewResponse.ProductInfo.builder()
                    .id(product.getId())
                    .name(product.getName())
                    .description(product.getDescription())
                    .price(product.getPrice())
                    .skuCode(product.getSkuCode())
                    .category(product.getCategory())
                    .imageUrls(product.getImageUrls())
                    .stockQuantity(product.getStockQuantity())
                    .active(product.getActive())
                    .inStock(product.getInStock())
                    .sellerId(product.getSellerId())
                    .createdAt(product.getCreatedAt())
                    .updatedAt(product.getUpdatedAt())
                    .build();
            response.setProduct(productInfo);
        } catch (Exception e) {
            log.error("Error fetching product info for review {}: {}", review.getId(), e.getMessage());
            // Set product to null if fetch fails
            response.setProduct(null);
        }

        return response;
    }
}
