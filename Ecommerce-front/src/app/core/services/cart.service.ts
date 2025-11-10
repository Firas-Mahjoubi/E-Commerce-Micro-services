import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Cart, CartItem } from '@core/models/cart.model';
import { Product } from '@core/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  
  private readonly CART_STORAGE_KEY = 'shopping_cart';
  
  private cartSubject = new BehaviorSubject<Cart>(this.loadCart());
  public cart$ = this.cartSubject.asObservable();

  constructor() {}

  /**
   * Get current cart value
   */
  getCart(): Cart {
    return this.cartSubject.value;
  }

  /**
   * Add product to cart
   */
  addToCart(product: Product, quantity: number = 1): void {
    const currentCart = this.getCart();
    const existingItem = currentCart.items.find(item => item.product.id === product.id);

    if (existingItem) {
      // Update quantity if product already in cart
      existingItem.quantity += quantity;
      // Check against available stock
      if (existingItem.quantity > product.stockQuantity) {
        existingItem.quantity = product.stockQuantity;
      }
    } else {
      // Add new item to cart
      const cartItem: CartItem = {
        product,
        quantity: Math.min(quantity, product.stockQuantity)
      };
      currentCart.items.push(cartItem);
    }

    this.updateCart(currentCart);
  }

  /**
   * Remove product from cart
   */
  removeFromCart(productId: string): void {
    const currentCart = this.getCart();
    currentCart.items = currentCart.items.filter(item => item.product.id !== productId);
    this.updateCart(currentCart);
  }

  /**
   * Update product quantity in cart
   */
  updateQuantity(productId: string, quantity: number): void {
    const currentCart = this.getCart();
    const item = currentCart.items.find(item => item.product.id === productId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        // Don't exceed available stock
        item.quantity = Math.min(quantity, item.product.stockQuantity);
        this.updateCart(currentCart);
      }
    }
  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    const emptyCart: Cart = {
      items: [],
      totalItems: 0,
      totalPrice: 0
    };
    this.updateCart(emptyCart);
  }

  /**
   * Get total items count in cart
   */
  getTotalItems(): number {
    return this.getCart().totalItems;
  }

  /**
   * Get total price of cart
   */
  getTotalPrice(): number {
    return this.getCart().totalPrice;
  }

  /**
   * Check if product is in cart
   */
  isInCart(productId: string): boolean {
    return this.getCart().items.some(item => item.product.id === productId);
  }

  /**
   * Get quantity of specific product in cart
   */
  getProductQuantity(productId: string): number {
    const item = this.getCart().items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }

  /**
   * Update cart and save to storage
   */
  private updateCart(cart: Cart): void {
    // Recalculate totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0
    );

    this.cartSubject.next(cart);
    this.saveCart(cart);
  }

  /**
   * Load cart from localStorage
   */
  private loadCart(): Cart {
    if (!this.isBrowser) {
      return { items: [], totalItems: 0, totalPrice: 0 };
    }

    try {
      const cartJson = localStorage.getItem(this.CART_STORAGE_KEY);
      if (cartJson) {
        return JSON.parse(cartJson);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }

    return { items: [], totalItems: 0, totalPrice: 0 };
  }

  /**
   * Save cart to localStorage
   */
  private saveCart(cart: Cart): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }
}
