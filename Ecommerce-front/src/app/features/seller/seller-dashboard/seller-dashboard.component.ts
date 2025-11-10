import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SellerNavbarComponent } from '../../../shared/components/seller-navbar/seller-navbar.component';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  skuCode: string;
  imageUrl?: string; // Keep for backward compatibility
  imageUrls?: string[]; // New array of image URLs
  category?: string;
  stock?: number; // Old field for backward compatibility
  stockQuantity?: number; // New field from backend
}

interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  pendingOrders: number;
}

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SellerNavbarComponent],
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.css']
})
export class SellerDashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingOrders: 0
  };

  recentProducts: Product[] = [];
  isLoading = true;
  sellerName = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSellerData();
    this.loadRecentProducts();
  }

  loadSellerData() {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.sellerName = userData.firstName || userData.username || 'Seller';
    }
  }

  loadRecentProducts() {
    this.http.get<Product[]>('http://localhost:8090/api/product')
      .subscribe({
        next: (products) => {
          this.recentProducts = products.slice(0, 5);
          this.stats.totalProducts = products.length;
          this.calculateStats(products);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.isLoading = false;
        }
      });
  }

  calculateStats(products: Product[]) {
    // Mock calculations - in real app, these would come from backend
    this.stats.totalRevenue = products.reduce((sum, p) => sum + (p.price * this.getProductStock(p) * 0.1), 0);
    this.stats.totalSales = Math.floor(products.reduce((sum, p) => sum + this.getProductStock(p) * 0.05, 0));
    this.stats.pendingOrders = Math.floor(Math.random() * 10);
  }

  // Get stock quantity (supports both old 'stock' and new 'stockQuantity' fields)
  getProductStock(product: Product): number {
    return product.stockQuantity ?? product.stock ?? 0;
  }

  navigateToProducts() {
    this.router.navigate(['/seller/products']);
  }

  navigateToAddProduct() {
    this.router.navigate(['/seller/products/add']);
  }

  navigateToOrders() {
    this.router.navigate(['/seller/orders']);
  }

  navigateToReviews() {
    this.router.navigate(['/seller/reviews']);
  }

  viewProduct(productId: string) {
    this.router.navigate(['/seller/products', productId]);
  }

  editProduct(productId: string) {
    this.router.navigate(['/seller/products/edit', productId]);
  }

  // Get the first image URL or fallback
  getProductImage(product: Product): string {
    // Priority: imageUrls array -> imageUrl -> placeholder
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
    if (product.imageUrl) {
      return product.imageUrl;
    }
    return 'https://via.placeholder.com/300x200';
  }
}
