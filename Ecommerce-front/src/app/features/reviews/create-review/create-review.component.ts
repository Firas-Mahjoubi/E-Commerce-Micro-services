import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService } from '@core/services/review.service';
import { AuthService } from '@core/services/auth.service';
import { ProductService } from '@core/services/product.service';
import { Product } from '@core/models/product.model';
import { Review } from '@core/models/review.model';

@Component({
  selector: 'app-create-review',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-review.component.html',
  styleUrls: ['./create-review.component.css']
})
export class CreateReviewComponent implements OnInit {
  reviewForm: FormGroup;
  productId: string = '';
  product: Product | null = null;
  currentUser: any = null;
  hoveredRating = 0;
  loading = false;
  error: string | null = null;
  success = false;

  // Pour la modification
  existingReview: Review | null = null;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private authService: AuthService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('productId') || '';
    this.currentUser = this.authService.getCurrentUserValue();

    if (this.productId) {
      this.loadProduct();
      // Attendre un peu pour s'assurer que l'utilisateur est chargé
      setTimeout(() => this.checkExistingReview(), 100);
    } else {
      this.error = 'ID du produit non trouvé';
    }
  }

  /**
   * Décoder le token JWT pour extraire les informations utilisateur
   */
  private decodeToken(): any {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return null;
      }

      // Décoder le payload (partie centrale du JWT)
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));

      return decodedPayload;
    } catch (error) {
      console.error('❌ Erreur décodage token:', error);
      return null;
    }
  }

  /**
   * Récupérer les informations utilisateur depuis le token
   */
  private getUserInfoFromToken(): { userId: string; userName: string; userEmail: string } {
    // Priorité 1: Utiliser currentUser s'il est disponible (plus fiable)
    if (this.currentUser) {
      return {
        userId: this.currentUser.sub || this.currentUser.id || '',
        userName: this.currentUser.name || this.currentUser.username || 'Utilisateur',
        userEmail: this.currentUser.email || ''
      };
    }

    // Priorité 2: Décoder le token si currentUser n'est pas disponible
    const tokenData = this.decodeToken();
    if (tokenData) {
      return {
        userId: tokenData.sub || '',
        userName: tokenData.name || tokenData.preferred_username || tokenData.given_name || 'Utilisateur',
        userEmail: tokenData.email || ''
      };
    }

    // Fallback: valeurs vides
    return {
      userId: '',
      userName: 'Utilisateur',
      userEmail: ''
    };
  }  loadProduct(): void {
    this.productService.getProductById(this.productId).subscribe({
      next: (data) => {
        this.product = data;
      },
      error: (err) => {
        this.error = 'Impossible de charger le produit';
        console.error(err);
      }
    });
  }

  /**
   * Vérifier si l'utilisateur a déjà fait un avis sur ce produit
   */
  checkExistingReview(): void {
    // Récupérer userId depuis le token
    const userInfo = this.getUserInfoFromToken();
    const userId = userInfo.userId;

    if (!userId) {
      return;
    }

    this.reviewService.getReviewsByProductId(this.productId).subscribe({
      next: (reviews) => {
        // Chercher un avis de cet utilisateur (comparaison flexible)
        this.existingReview = reviews.find(r => {
          return r.userId === userId ||
                 r.userId === String(userId) ||
                 String(r.userId) === String(userId);
        }) || null;

        if (this.existingReview) {
          this.isEditMode = true;

          // Pré-remplir le formulaire avec l'avis existant
          this.reviewForm.patchValue({
            rating: this.existingReview.rating,
            title: this.existingReview.title,
            comment: this.existingReview.comment
          });
        }
      },
      error: (err) => {
        console.error('❌ Erreur lors de la vérification de l\'avis existant:', err);
      }
    });
  }  setRating(rating: number): void {
    this.reviewForm.patchValue({ rating });
  }

  setHoveredRating(rating: number): void {
    this.hoveredRating = rating;
  }

  getRatingArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }

  get currentRating(): number {
    return this.reviewForm.get('rating')?.value || 0;
  }

  get displayRating(): number {
    return this.hoveredRating || this.currentRating;
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) {
      Object.keys(this.reviewForm.controls).forEach(key => {
        this.reviewForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = null;

    // Récupérer les informations depuis le token
    const userInfo = this.getUserInfoFromToken();

    const reviewRequest = {
      productId: this.productId,
      userId: userInfo.userId,
      userName: userInfo.userName,
      userEmail: userInfo.userEmail,
      rating: this.reviewForm.value.rating,
      title: this.reviewForm.value.title,
      comment: this.reviewForm.value.comment,
      verified: false
    };

    // Mode modification ou création
    const apiCall = this.isEditMode && this.existingReview
      ? this.reviewService.updateReview(this.existingReview.id, reviewRequest)
      : this.reviewService.createReview(reviewRequest);

    apiCall.subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/products', this.productId]);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.message || `Erreur lors de ${this.isEditMode ? 'la modification' : 'la création'} de l'avis`;
        this.loading = false;
        console.error('❌ Erreur soumission:', err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/products', this.productId]);
  }
}
