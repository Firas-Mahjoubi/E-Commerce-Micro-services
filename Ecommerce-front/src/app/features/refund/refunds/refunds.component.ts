import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RefundService } from '@core/services/refund.service';
import { RefundResponse, RefundStatus } from '@core/models/refund.model';

@Component({
  selector: 'app-refunds',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './refunds.component.html',
  styleUrls: ['./refunds.component.css']
})
export class RefundsComponent implements OnInit {
  private refundService = inject(RefundService);
  private router = inject(Router);

  refunds: RefundResponse[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadRefunds();
  }

  loadRefunds(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.refundService.getCustomerRefunds().subscribe({
      next: (refunds) => {
        this.refunds = refunds.sort((a, b) =>
          new Date(b.refundedAt).getTime() - new Date(a.refundedAt).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading refunds:', error);
        this.errorMessage = error.message || 'Failed to load refunds';
        this.isLoading = false;
      }
    });
  }

  viewRefundDetails(refundId: number): void {
    this.router.navigate(['/refunds', refundId]);
  }

  getStatusClass(status: string): string {
    const statusUpper = status.toUpperCase();
    if (statusUpper === 'PENDING') return 'status-pending';
    if (statusUpper === 'APPROVED') return 'status-approved';
    if (statusUpper === 'COMPLETED') return 'status-completed';
    if (statusUpper === 'REJECTED') return 'status-rejected';
    return 'status-default';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
}
