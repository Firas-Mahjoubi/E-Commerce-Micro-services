import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Review,
  ReviewRequest,
  ReviewStatistics,
  SellerReviewStatistics,
  ReviewTrends
} from '@core/models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private API_URL = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // ==================== CUSTOMER FEATURES ====================

  /**
   * Create a new review
   */
  createReview(reviewRequest: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.API_URL}/review`, reviewRequest);
  }

  /**
   * Get all reviews for a product
   */
  getReviewsByProductId(productId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.API_URL}/review/product/${productId}`);
  }

  /**
   * Get verified reviews for a product
   */
  getVerifiedReviewsByProductId(productId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.API_URL}/review/product/${productId}/verified`);
  }

  /**
   * Get reviews by user ID
   */
  getReviewsByUserId(userId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.API_URL}/review/user/${userId}`);
  }

  /**
   * Get review by ID
   */
  getReviewById(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.API_URL}/review/${id}`);
  }

  /**
   * Update a review
   */
  updateReview(id: number, reviewRequest: ReviewRequest): Observable<Review> {
    return this.http.put<Review>(`${this.API_URL}/review/${id}`, reviewRequest);
  }

  /**
   * Delete a review
   */
  deleteReview(id: number, userId?: string): Observable<void> {
    const params = userId ? new HttpParams().set('userId', userId) : new HttpParams();
    return this.http.delete<void>(`${this.API_URL}/review/${id}`, { params });
  }

  /**
   * Get average rating for a product
   */
  getAverageRatingForProduct(productId: string): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/review/product/${productId}/average-rating`);
  }

  /**
   * Get rating distribution for a product
   */
  getRatingDistribution(productId: string): Observable<{ [key: number]: number }> {
    return this.http.get<{ [key: number]: number }>(`${this.API_URL}/review/product/${productId}/rating-distribution`);
  }

  /**
   * Get review statistics for a product
   */
  getReviewStatistics(productId: string): Observable<ReviewStatistics> {
    return this.http.get<ReviewStatistics>(`${this.API_URL}/review/product/${productId}/statistics`);
  }

  /**
   * Get reviews by rating range
   */
  getReviewsByRatingRange(productId: string, minRating: number, maxRating: number): Observable<Review[]> {
    const params = new HttpParams()
      .set('minRating', minRating.toString())
      .set('maxRating', maxRating.toString());
    return this.http.get<Review[]>(`${this.API_URL}/review/product/${productId}/rating-range`, { params });
  }

  /**
   * Search reviews by keyword
   */
  searchReviews(keyword: string): Observable<Review[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<Review[]>(`${this.API_URL}/review/search`, { params });
  }

  /**
   * Get recent verified reviews
   */
  getRecentVerifiedReviews(limit: number = 10): Observable<Review[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<Review[]>(`${this.API_URL}/review/recent-verified`, { params });
  }

  // ==================== SELLER FEATURES ====================

  /**
   * Get seller's review statistics
   */
  getSellerReviewStatistics(sellerId: string): Observable<SellerReviewStatistics> {
    return this.http.get<SellerReviewStatistics>(`${this.API_URL}/review/seller/${sellerId}/statistics`);
  }

  /**
   * Get all reviews for seller's products
   */
  getSellerProductReviews(sellerId: string, page: number = 0, size: number = 20): Observable<Review[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Review[]>(`${this.API_URL}/review/seller/${sellerId}/reviews`, { params });
  }

  /**
   * Get seller's review trends (last 30 days)
   */
  getSellerReviewTrends(sellerId: string): Observable<ReviewTrends> {
    return this.http.get<ReviewTrends>(`${this.API_URL}/review/seller/${sellerId}/trends`);
  }

  /**
   * Get top rated products
   */
  getTopRatedProducts(limit: number = 10): Observable<any[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any[]>(`${this.API_URL}/review/top-rated-products`, { params });
  }

  /**
   * Get all reviews (admin/seller)
   */
  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.API_URL}/review`);
  }
}
