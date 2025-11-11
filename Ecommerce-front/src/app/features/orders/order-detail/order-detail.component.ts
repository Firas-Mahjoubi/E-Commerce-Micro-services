import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService } from '@core/services/order.service';
import { OrderResponse } from '@core/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  private orderService = inject(OrderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  order: OrderResponse | null = null;
  isLoading = true;
  errorMessage = '';
  isCancelling = false;
  cancelSuccess = false;

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetails(+orderId);
    } else {
      this.errorMessage = 'Invalid order ID';
      this.isLoading = false;
    }
  }

  loadOrderDetails(orderId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getOrderByIdAndCustomer(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        this.errorMessage = error.message || 'Failed to load order details';
        this.isLoading = false;
      }
    });
  }

  cancelOrder(): void {
    if (!this.order || this.order.status.toUpperCase() !== 'PENDING') {
      return;
    }

    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    this.isCancelling = true;
    this.errorMessage = '';

    this.orderService.cancelOrder(this.order.id).subscribe({
      next: () => {
        this.cancelSuccess = true;
        this.isCancelling = false;
        // Reload order to get updated status
        this.loadOrderDetails(this.order!.id);

        // Redirect to orders list after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/orders']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error cancelling order:', error);
        this.errorMessage = error.message || 'Failed to cancel order';
        this.isCancelling = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'status-pending';
    if (statusLower === 'paid' || statusLower === 'completed') return 'status-completed';
    if (statusLower === 'shipped') return 'status-shipped';
    if (statusLower === 'cancelled') return 'status-cancelled';
    return 'status-default';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  canCancelOrder(): boolean {
    return this.order !== null && this.order.status.toUpperCase() === 'PENDING';
  }

  canRequestRefund(): boolean {
    if (!this.order) return false;
    const status = this.order.status.toUpperCase();
    console.log('Order status:', status);
    console.log('Can request refund:', status !== 'CANCELLED' && status !== 'PENDING');
    // Allow refunds for all orders except cancelled and pending
    return status !== 'CANCELLED' && status !== 'PENDING';
  }
}
