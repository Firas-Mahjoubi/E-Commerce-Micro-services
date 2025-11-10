import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, Review, ReviewRequest, ReviewStatistics } from '@core/services/review.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {
  @Input() productId!: string;

  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);

  reviews: Review[] = [];
  statistics: ReviewStatistics | null = null;
  isLoading = false;
  errorMessage = '';

  // New review form
  showReviewForm = false;
  newReview: ReviewRequest = {
    productId: '',
    userId: '',
    rating: 5,
    comment: ''
  };
  isSubmitting = false;

  // Edit review
  editingReview: Review | null = null;
  editReview: ReviewRequest = {
    productId: '',
    userId: '',
    rating: 5,
    comment: ''
  };

  // Filter options
  showVerifiedOnly = false;
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' = 'newest';

  ngOnInit(): void {
    if (this.productId) {
      this.loadReviews();
      this.loadStatistics();
    }
  }

  ngOnChanges(): void {
    if (this.productId) {
      this.loadReviews();
      this.loadStatistics();
    }
  }

  loadReviews(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const observable = this.showVerifiedOnly
      ? this.reviewService.getVerifiedReviewsByProductId(this.productId)
      : this.reviewService.getReviewsByProductId(this.productId);

    observable.subscribe({
      next: (reviews) => {
        this.reviews = this.sortReviews(reviews);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.errorMessage = 'Failed to load reviews. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  loadStatistics(): void {
    this.reviewService.getReviewStatistics(this.productId).subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (error) => {
        console.error('Error loading review statistics:', error);
      }
    });
  }

  sortReviews(reviews: Review[]): Review[] {
    switch (this.sortBy) {
      case 'newest':
        return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return reviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'highest':
        return reviews.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return reviews.sort((a, b) => a.rating - b.rating);
      default:
        return reviews;
    }
  }

  onFilterChange(): void {
    this.loadReviews();
  }

  onSortChange(): void {
    this.reviews = this.sortReviews(this.reviews);
  }

  toggleReviewForm(): void {
    this.showReviewForm = !this.showReviewForm;
    if (this.showReviewForm) {
      this.newReview = {
        productId: this.productId,
        userId: this.authService.getCurrentUserValue()?.id || '',
        rating: 5,
        comment: ''
      };
    }
  }

  submitReview(): void {
    if (!this.newReview.comment.trim()) {
      this.errorMessage = 'Please enter a comment for your review.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.reviewService.createReview(this.newReview).subscribe({
      next: (review) => {
        this.reviews.unshift(review);
        this.showReviewForm = false;
        this.isSubmitting = false;
        this.loadStatistics(); // Refresh statistics
      },
      error: (error) => {
        console.error('Error creating review:', error);
        this.errorMessage = 'Failed to submit review. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  startEditReview(review: Review): void {
    this.editingReview = review;
    this.editReview = {
      productId: review.productId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment
    };
  }

  cancelEdit(): void {
    this.editingReview = null;
    this.editReview = {
      productId: '',
      userId: '',
      rating: 5,
      comment: ''
    };
  }

  updateReview(): void {
    if (!this.editingReview || !this.editReview.comment.trim()) {
      this.errorMessage = 'Please enter a comment for your review.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.reviewService.updateReview(this.editingReview.id, this.editReview).subscribe({
      next: (updatedReview) => {
        const index = this.reviews.findIndex(r => r.id === updatedReview.id);
        if (index !== -1) {
          this.reviews[index] = updatedReview;
        }
        this.cancelEdit();
        this.isSubmitting = false;
        this.loadStatistics(); // Refresh statistics
      },
      error: (error) => {
        console.error('Error updating review:', error);
        this.errorMessage = 'Failed to update review. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  deleteReview(review: Review): void {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    this.reviewService.deleteReview(review.id, review.userId).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== review.id);
        this.loadStatistics(); // Refresh statistics
      },
      error: (error) => {
        console.error('Error deleting review:', error);
        this.errorMessage = 'Failed to delete review. Please try again.';
      }
    });
  }

  canEditReview(review: Review): boolean {
    const currentUserId = this.authService.getCurrentUserValue()?.id;
    return currentUserId === review.userId;
  }

  canDeleteReview(review: Review): boolean {
    const currentUserId = this.authService.getCurrentUserValue()?.id;
    return currentUserId === review.userId;
  }

  getStarArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  isStarActive(starNumber: number, rating: number): boolean {
    return starNumber <= rating;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getRatingPercentage(rating: number): number {
    if (!this.statistics || this.statistics.totalReviews === 0) return 0;
    return (this.statistics.ratingDistribution[rating] || 0) / this.statistics.totalReviews * 100;
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
