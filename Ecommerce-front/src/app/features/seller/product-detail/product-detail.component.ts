import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SellerNavbarComponent } from '../../../shared/components/seller-navbar/seller-navbar.component';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  skuCode: string;
  imageUrls?: string[];
  category?: string;
  stockQuantity?: number;
  active?: boolean;
  sellerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-seller-product-detail',
  standalone: true,
  imports: [CommonModule, SellerNavbarComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class SellerProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  product: Product | null = null;
  selectedImage: string = '';
  isLoading = true;
  errorMessage = '';

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    }
  }

  loadProduct(id: string) {
    this.isLoading = true;
    this.http.get<Product>(`http://localhost:8090/api/product/${id}`)
      .subscribe({
        next: (product) => {
          this.product = product;
          this.selectedImage = this.getDefaultImage(product);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.errorMessage = 'Failed to load product details.';
          this.isLoading = false;
        }
      });
  }

  getDefaultImage(product: Product): string {
    if (product.imageUrls && product.imageUrls.length > 0) {
      return this.getImageUrl(product.imageUrls[0]);
    }
    return 'https://via.placeholder.com/600x400';
  }

  getImageUrl(imageUrl: string): string {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    if (imageUrl.startsWith('/api')) {
      return `http://localhost:8090${imageUrl}`;
    }
    return `http://localhost:8090/api/product/upload/${imageUrl}`;
  }

  selectImage(imageUrl: string) {
    this.selectedImage = this.getImageUrl(imageUrl);
  }

  goBack() {
    this.router.navigate(['/seller/products']);
  }

  editProduct() {
    if (this.product) {
      this.router.navigate(['/seller/products/edit', this.product.id]);
    }
  }

  deleteProduct() {
    if (this.product && confirm('Are you sure you want to delete this product?')) {
      this.http.delete(`http://localhost:8090/api/product/${this.product.id}`)
        .subscribe({
          next: () => {
            this.router.navigate(['/seller/products']);
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Please try again.');
          }
        });
    }
  }
}
