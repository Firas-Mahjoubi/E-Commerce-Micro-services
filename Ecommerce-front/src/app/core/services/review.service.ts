import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Review {
  id: number;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  userName?: string;
}

export interface ReviewRequest {
  productId: string;
  userId: string;
  rating: number;
  comment: string;
}

export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

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
   * Create a new review
   */
  createReview(reviewRequest: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.API_URL}/review`, reviewRequest);
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
   * Get review statistics for a product
   */
  getReviewStatistics(productId: string): Observable<ReviewStatistics> {
    return this.http.get<ReviewStatistics>(`${this.API_URL}/review/product/${productId}/statistics`);
  }

  /**
   * Get rating distribution for a product
   */
  getRatingDistribution(productId: string): Observable<{ [key: number]: number }> {
    return this.http.get<{ [key: number]: number }>(`${this.API_URL}/review/product/${productId}/rating-distribution`);
  }
}
