import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReviewService } from '@core/services/review.service';
import { AuthService } from '@core/services/auth.service';
import { Review, SellerReviewStatistics } from '@core/models/review.model';

@Component({
  selector: 'app-seller-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-reviews.component.html',
  styleUrls: ['./seller-reviews.component.css']
})
export class SellerReviewsComponent implements OnInit {
  sellerId: string = '';
  statistics: SellerReviewStatistics | null = null;
  reviews: Review[] = [];
  filteredReviews: Review[] = [];
  loading = false;
  error: string | null = null;

  // Filtres
  selectedRating: number | null = null;
  selectedProduct: string | null = null;
  showVerifiedOnly = false;
  sortBy: 'newest' | 'highest' | 'lowest' = 'newest';
  searchTerm = '';

  // Pagination
  currentPage = 0;
  pageSize = 20;
  hasMore = true;

  // Make Math available in template
  Math = Math;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUserValue();
    this.sellerId = currentUser?.id || '';

    if (this.sellerId) {
      this.loadStatistics();
      this.loadReviews();
    }
  }  loadStatistics(): void {
    this.reviewService.getSellerReviewStatistics(this.sellerId).subscribe({
      next: (data) => {
        this.statistics = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques', err);
      }
    });
  }

  loadReviews(append = false): void {
    this.loading = true;
    this.error = null;

    this.reviewService.getSellerProductReviews(this.sellerId, this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        if (append) {
          this.reviews = [...this.reviews, ...data];
        } else {
          this.reviews = data;
        }
        this.hasMore = data.length === this.pageSize;
        this.loading = false;
        this.applyFilters();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des avis';
        this.loading = false;
        console.error(err);
      }
    });
  }

  /**
   * Appliquer les filtres et le tri
   */
  applyFilters(): void {
    let filtered = [...this.reviews];

    // Filtre par note
    if (this.selectedRating !== null) {
      filtered = filtered.filter(r => r.rating === this.selectedRating);
    }

    // Filtre par produit
    if (this.selectedProduct) {
      filtered = filtered.filter(r => r.product?.id === this.selectedProduct);
    }

    // Filtre achats vérifiés
    if (this.showVerifiedOnly) {
      filtered = filtered.filter(r => r.verified);
    }

    // Recherche par texte
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(term) ||
        r.comment.toLowerCase().includes(term) ||
        r.product?.name.toLowerCase().includes(term)
      );
    }

    // Tri
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

  /**
   * Filtrer par note
   */
  filterByRating(rating: number | null): void {
    this.selectedRating = rating;
    this.applyFilters();
  }

  /**
   * Changer le tri
   */
  changeSortBy(): void {
    this.applyFilters();
  }

  /**
   * Toggle filtre achats vérifiés
   */
  toggleVerifiedOnly(): void {
    this.showVerifiedOnly = !this.showVerifiedOnly;
    this.applyFilters();
  }

  /**
   * Rechercher dans les avis
   */
  onSearchChange(): void {
    this.applyFilters();
  }

  /**
   * Voir le produit
   */
  viewProduct(productId: string): void {
    this.router.navigate(['/seller/products', productId]);
  }

  /**
   * Retour au dashboard
   */
  goBack(): void {
    this.router.navigate(['/seller/dashboard']);
  }

  loadMore(): void {
    if (!this.loading && this.hasMore) {
      this.currentPage++;
      this.loadReviews(true);
    }
  }

  getRatingArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }

  getRatingDistributionArray(): { rating: number; count: number; percentage: number }[] {
    if (!this.statistics || !this.statistics.ratingDistribution) return [];

    const dist = this.statistics.ratingDistribution;
    const total = this.statistics.totalReviews || 1;

    return [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: dist[rating] || 0,
      percentage: ((dist[rating] || 0) / total) * 100
    }));
  }
}
