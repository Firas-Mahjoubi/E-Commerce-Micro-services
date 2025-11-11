import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '@core/services/product.service';
import { CartService } from '@core/services/cart.service';
import { Product } from '@core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  product: Product | null = null;
  selectedImage: string = '';
  quantity: number = 1;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    }
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.selectedImage = this.getDefaultImage(product);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.errorMessage = 'Product not found or unavailable.';
        this.isLoading = false;
      }
    });
  }

  selectImage(imageUrl: string): void {
    this.selectedImage = imageUrl;
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stockQuantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
    }
  }

  buyNow(): void {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
      this.router.navigate(['/cart']);
    }
  }

  getDefaultImage(product: Product): string {
    if (product.imageUrls && product.imageUrls.length > 0) {
      const imageUrl = product.imageUrls[0];
      // If it's already a full URL, return it
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      // If it starts with /api, prepend the base URL
      if (imageUrl.startsWith('/api')) {
        return `http://localhost:8090${imageUrl}`;
      }
      // Otherwise, assume it's just a filename
      return `http://localhost:8090/api/product/upload/${imageUrl}`;
    }
    return 'https://via.placeholder.com/600x400';
  }

  getImageUrl(imageUrl: string): string {
    // If it's already a full URL, return it
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // If it starts with /api, prepend the base URL
    if (imageUrl.startsWith('/api')) {
      return `http://localhost:8090${imageUrl}`;
    }
    // Otherwise, assume it's just a filename
    return `http://localhost:8090/api/product/upload/${imageUrl}`;
  }

  isInCart(): boolean {
    return this.product ? this.cartService.isInCart(this.product.id) : false;
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  viewReviews(): void {
    if (this.product) {
      this.router.navigate(['/reviews/product', this.product.id]);
    }
  }

  writeReview(): void {
    if (this.product) {
      this.router.navigate(['/reviews/create', this.product.id]);
    }
  }
}
