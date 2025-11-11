import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '@core/services/order.service';
import { OrderResponse } from '@core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private router = inject(Router);

  orders: OrderResponse[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders.sort((a, b) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.errorMessage = error.message || 'Failed to load orders';
        this.isLoading = false;
      }
    });
  }

  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
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
}
