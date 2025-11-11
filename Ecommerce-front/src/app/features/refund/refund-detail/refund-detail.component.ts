import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RefundService } from '@core/services/refund.service';
import { RefundResponse, RefundStatus } from '@core/models/refund.model';

@Component({
  selector: 'app-refund-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './refund-detail.component.html',
  styleUrls: ['./refund-detail.component.css']
})
export class RefundDetailComponent implements OnInit {
  private refundService = inject(RefundService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  refund: RefundResponse | null = null;
  isLoading = true;
  errorMessage = '';
  isCancelling = false;
  cancelSuccess = false;

  ngOnInit(): void {
    const refundId = this.route.snapshot.paramMap.get('id');
    if (refundId) {
      this.loadRefundDetails(+refundId);
    } else {
      this.errorMessage = 'Invalid refund ID';
      this.isLoading = false;
    }
  }

  loadRefundDetails(refundId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.refundService.getRefundById(refundId).subscribe({
      next: (refund) => {
        this.refund = refund;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading refund details:', error);
        this.errorMessage = error.message || 'Failed to load refund details';
        this.isLoading = false;
      }
    });
  }

  cancelRefund(): void {
    if (!this.refund || this.refund.status !== RefundStatus.PENDING) {
      return;
    }

    if (!confirm('Are you sure you want to cancel this refund request?')) {
      return;
    }

    this.isCancelling = true;
    this.errorMessage = '';

    this.refundService.cancelRefund(this.refund.refundId).subscribe({
      next: () => {
        this.cancelSuccess = true;
        this.isCancelling = false;
        // Reload refund to get updated status
        this.loadRefundDetails(this.refund!.refundId);

        // Redirect to refunds list after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/refunds']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error cancelling refund:', error);
        this.errorMessage = error.message || 'Failed to cancel refund';
        this.isCancelling = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/refunds']);
  }

  viewOrder(): void {
    if (this.refund) {
      this.router.navigate(['/orders', this.refund.orderId]);
    }
  }

  getStatusClass(status: string): string {
    const statusUpper = status.toUpperCase();
    if (statusUpper === 'PENDING') return 'status-pending';
    if (statusUpper === 'APPROVED') return 'status-approved';
    if (statusUpper === 'COMPLETED') return 'status-completed';
    if (statusUpper === 'REJECTED') return 'status-rejected';
    return 'status-default';
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  canCancelRefund(): boolean {
    return this.refund !== null && this.refund.status === RefundStatus.PENDING;
  }
}
