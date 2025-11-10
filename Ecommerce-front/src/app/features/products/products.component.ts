import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '@core/services/product.service';
import { CartService } from '@core/services/cart.service';
import { Product } from '@core/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  selectedCategory: string = 'all';
  searchQuery: string = '';
  isLoading = false;
  errorMessage = '';
  
  // Price range filter
  minPrice: number = 0;
  maxPrice: number = 10000;
  filterMinPrice: number = 0;
  filterMaxPrice: number = 10000;

  // Cart items count
  cartItemsCount = 0;

  ngOnInit(): void {
    this.loadProducts();
    this.cartService.cart$.subscribe(cart => {
      this.cartItemsCount = cart.totalItems;
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getActiveProducts().subscribe({
      next: (products) => {
        console.log('[ProductsComponent] Loaded products:', products.length);
        // Filter products with stock > 0 (inStock can be null, so check stockQuantity only)
        this.products = products.filter(p => p.stockQuantity > 0);
        console.log('[ProductsComponent] Products after filter:', this.products.length);
        this.filteredProducts = [...this.products];
        this.extractCategories();
        this.calculatePriceRange();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage = 'Failed to load products. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  extractCategories(): void {
    const categorySet = new Set(this.products.map(p => p.category));
    this.categories = Array.from(categorySet).sort();
  }

  calculatePriceRange(): void {
    if (this.products.length === 0) return;
    
    const prices = this.products.map(p => p.price);
    this.minPrice = Math.floor(Math.min(...prices));
    this.maxPrice = Math.ceil(Math.max(...prices));
    this.filterMinPrice = this.minPrice;
    this.filterMaxPrice = this.maxPrice;
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onPriceRangeChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      // Category filter
      const categoryMatch = this.selectedCategory === 'all' || product.category === this.selectedCategory;
      
      // Search filter
      const searchMatch = !this.searchQuery || 
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      // Price range filter
      const priceMatch = product.price >= this.filterMinPrice && product.price <= this.filterMaxPrice;
      
      return categoryMatch && searchMatch && priceMatch;
    });
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
  }

  isInCart(productId: string): boolean {
    return this.cartService.isInCart(productId);
  }

  getDefaultImage(product: Product): string {
    return product.imageUrls && product.imageUrls.length > 0 
      ? product.imageUrls[0] 
      : 'assets/images/product-placeholder.png';
  }

  clearFilters(): void {
    this.selectedCategory = 'all';
    this.searchQuery = '';
    this.filterMinPrice = this.minPrice;
    this.filterMaxPrice = this.maxPrice;
    this.applyFilters();
  }
}
