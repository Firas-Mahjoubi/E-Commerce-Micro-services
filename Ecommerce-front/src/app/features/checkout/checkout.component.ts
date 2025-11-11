import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '@core/services/cart.service';
import { OrderService } from '@core/services/order.service';
import { AuthService } from '@core/services/auth.service';
import { CartItem } from '@core/models/cart.model';
import { CreateOrderRequest, OrderItem } from '@core/models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);

  cartItems: CartItem[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/checkout' }
      });
      return;
    }

    // Load cart items
    this.cartItems = this.cartService.getCart().items;

    // Redirect if cart is empty
    if (this.cartItems.length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  get total(): number {
    return this.cartService.getTotalPrice();
  }

  placeOrder(): void {
    if (this.cartItems.length === 0) {
      this.errorMessage = 'Your cart is empty';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Convert cart items to order items
    const orderItems: OrderItem[] = this.cartItems.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.price
    }));

    const orderRequest: CreateOrderRequest = {
      items: orderItems
    };

    this.orderService.createOrder(orderRequest).subscribe({
      next: (response) => {
        this.successMessage = `Order #${response.id} placed successfully!`;
        this.cartService.clearCart();

        // Redirect to orders page after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/orders']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error placing order:', error);
        this.errorMessage = error.message || 'Failed to place order. Please try again.';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }
}
