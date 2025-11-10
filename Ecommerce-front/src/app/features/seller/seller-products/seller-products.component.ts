import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SellerNavbarComponent } from '../../../shared/components/seller-navbar/seller-navbar.component';

interface Product {
  id?: string;
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

@Component({
  selector: 'app-seller-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SellerNavbarComponent],
  templateUrl: './seller-products.component.html',
  styleUrls: ['./seller-products.component.css']
})
export class SellerProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading = true;
  searchTerm = '';
  selectedCategory = 'all';
  categories: string[] = ['all'];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.http.get<Product[]>('http://localhost:8090/api/product')
      .subscribe({
        next: (products) => {
          this.products = products;
          this.filteredProducts = products;
          this.extractCategories();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.isLoading = false;
        }
      });
  }

  extractCategories() {
    const uniqueCategories = new Set(this.products.map(p => p.category || 'Uncategorized'));
    this.categories = ['all', ...Array.from(uniqueCategories)];
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === 'all' || product.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  onSearchChange() {
    this.filterProducts();
  }

  onCategoryChange() {
    this.filterProducts();
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

  // Get stock quantity (supports both old 'stock' and new 'stockQuantity' fields)
  getProductStock(product: Product): number {
    return product.stockQuantity ?? product.stock ?? 0;
  }

  addProduct() {
    this.router.navigate(['/seller/products/add']);
  }

  editProduct(productId: string) {
    this.router.navigate(['/seller/products/edit', productId]);
  }

  deleteProduct(productId: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.http.delete(`http://localhost:8090/api/product/${productId}`)
        .subscribe({
          next: () => {
            this.loadProducts();
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Please try again.');
          }
        });
    }
  }

  viewProduct(productId: string) {
    this.router.navigate(['/seller/products', productId]);
  }
}
