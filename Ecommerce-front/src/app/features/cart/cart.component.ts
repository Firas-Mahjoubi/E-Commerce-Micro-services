import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '@core/services/cart.service';
import { Cart, CartItem } from '@core/models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);

  cart: Cart = { items: [], totalItems: 0, totalPrice: 0 };

  ngOnInit(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });
  }

  updateQuantity(productId: string, newQuantity: number): void {
    if (newQuantity > 0) {
      this.cartService.updateQuantity(productId, newQuantity);
    }
  }

  increaseQuantity(item: CartItem): void {
    if (item.quantity < item.product.stockQuantity) {
      this.cartService.updateQuantity(item.product.id, item.quantity + 1);
    }
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.product.id, item.quantity - 1);
    }
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  getItemTotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  proceedToCheckout(): void {
    if (this.cart.items.length > 0) {
      alert('Checkout functionality will be implemented in the next phase!');
      // TODO: Navigate to checkout page
      // this.router.navigate(['/checkout']);
    }
  }

  getDefaultImage(item: CartItem): string {
    return item.product.imageUrls && item.product.imageUrls.length > 0 
      ? item.product.imageUrls[0] 
      : 'assets/images/product-placeholder.png';
  }
}
