import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReviewService } from '@core/services/review.service';
import { AuthService } from '@core/services/auth.service';
import { Review } from '@core/models/review.model';

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-reviews.component.html',
  styleUrls: ['./my-reviews.component.css']
})
export class MyReviewsComponent implements OnInit {
  userId: string = '';
  reviews: Review[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUserValue();
    this.userId = currentUser?.id || '';

    if (this.userId) {
      this.loadMyReviews();
    }
  }

  loadMyReviews(): void {
    this.loading = true;
    this.error = null;

    this.reviewService.getReviewsByUserId(this.userId).subscribe({
      next: (data) => {
        this.reviews = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de vos avis';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteReview(reviewId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      this.reviewService.deleteReview(reviewId, this.userId).subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r.id !== reviewId);
        },
        error: (err) => {
          alert('Erreur lors de la suppression de l\'avis');
          console.error(err);
        }
      });
    }
  }

  viewProduct(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  getRatingArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
