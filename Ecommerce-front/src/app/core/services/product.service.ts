import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, InventoryResponse } from '@core/models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  /**
   * Get all products with available stock (quantity > 0)
   */
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/product`);
  }

  /**
   * Get product by ID
   */
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/product/${id}`);
  }

  /**
   * Get products by category
   */
  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/product/category/${category}`);
  }

  /**
   * Search products by name
   */
  searchProducts(name: string): Observable<Product[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Product[]>(`${this.API_URL}/product/search`, { params });
  }

  /**
   * Get products by price range
   */
  getProductsByPriceRange(minPrice: number, maxPrice: number): Observable<Product[]> {
    const params = new HttpParams()
      .set('minPrice', minPrice.toString())
      .set('maxPrice', maxPrice.toString());
    return this.http.get<Product[]>(`${this.API_URL}/product/price-range`, { params });
  }

  /**
   * Get active products only
   */
  getActiveProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/product/active`);
  }

  /**
   * Check inventory stock for products
   */
  checkInventory(skuCodes: string[]): Observable<InventoryResponse[]> {
    const params = new HttpParams().set('skuCode', skuCodes.join(','));
    return this.http.get<InventoryResponse[]>(`${this.API_URL}/inventory`, { params });
  }

  /**
   * Get inventory for a specific SKU
   */
  getInventoryBySkuCode(skuCode: string): Observable<InventoryResponse> {
    return this.http.get<InventoryResponse>(`${this.API_URL}/inventory/${skuCode}`);
  }
}
