import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService } from '@core/services/review.service';
import { AuthService } from '@core/services/auth.service';
import { Review, ReviewStatistics } from '@core/models/review.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-reviews.component.html',
  styleUrls: ['./product-reviews.component.css']
})
export class ProductReviewsComponent implements OnInit {
  productId: string = '';
  reviews: Review[] = [];
  filteredReviews: Review[] = [];
  statistics: ReviewStatistics | null = null;
  loading = false;
  error: string | null = null;
  currentUser: any = null;

  // Filters
  selectedRating: number | null = null;
  showVerifiedOnly = false;
  sortBy: 'newest' | 'highest' | 'lowest' = 'newest';

  // Make Math available in template
  Math = Math;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    this.currentUser = this.authService.getCurrentUserValue();
    if (this.productId) {
      this.loadReviews();
      this.loadStatistics();
    }
  }

  loadReviews(): void {
    this.loading = true;
    this.error = null;

    const observable = this.showVerifiedOnly
      ? this.reviewService.getVerifiedReviewsByProductId(this.productId)
      : this.reviewService.getReviewsByProductId(this.productId);

    observable.subscribe({
      next: (data) => {
        this.reviews = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des avis';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadStatistics(): void {
    this.reviewService.getReviewStatistics(this.productId).subscribe({
      next: (data) => {
        this.statistics = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques', err);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.reviews];

    // Filter by rating
    if (this.selectedRating !== null) {
      filtered = filtered.filter(r => r.rating === this.selectedRating);
    }

    // Sort
    switch (this.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
    }

    this.filteredReviews = filtered;
  }

  filterByRating(rating: number | null): void {
    this.selectedRating = rating;
    this.applyFilters();
  }

  toggleVerifiedOnly(): void {
    this.showVerifiedOnly = !this.showVerifiedOnly;
    this.loadReviews();
  }

  changeSortBy(sort: 'newest' | 'highest' | 'lowest'): void {
    this.sortBy = sort;
    this.applyFilters();
  }

  getRatingArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }

  getRatingDistributionArray(): { rating: number; count: number; percentage: number }[] {
    if (!this.statistics) return [];

    const dist = this.statistics.ratingDistribution;
    const total = this.statistics.totalReviews || 1;

    return [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: dist[rating] || 0,
      percentage: ((dist[rating] || 0) / total) * 100
    }));
  }

  writeReview(): void {
    this.router.navigate(['/reviews/create', this.productId]);
  }

  /**
   * Vérifier si l'avis appartient à l'utilisateur connecté
   */
  isMyReview(review: Review): boolean {
    if (!this.currentUser) return false;
    const currentUserId = this.currentUser.sub || this.currentUser.id;
    return review.userId === currentUserId || String(review.userId) === String(currentUserId);
  }

  /**
   * Supprimer l'avis
   */
  deleteReview(review: Review): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return;
    }

    this.reviewService.deleteReview(review.id).subscribe({
      next: () => {
        // Recharger les avis et statistiques
        this.loadReviews();
        this.loadStatistics();
      },
      error: (err) => {
        this.error = 'Erreur lors de la suppression de l\'avis';
        console.error(err);
      }
    });
  }

  /**
   * Retour à la page du produit
   */
  goBack(): void {
    this.router.navigate(['/products', this.productId]);
  }
}
