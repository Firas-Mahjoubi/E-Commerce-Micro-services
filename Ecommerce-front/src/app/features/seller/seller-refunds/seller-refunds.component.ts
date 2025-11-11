import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RefundService } from '@core/services/refund.service';
import { RefundResponse, RefundStatus } from '@core/models/refund.model';

@Component({
  selector: 'app-seller-refunds',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './seller-refunds.component.html',
  styleUrls: ['./seller-refunds.component.css']
})
export class SellerRefundsComponent implements OnInit {
  private refundService = inject(RefundService);
  private router = inject(Router);

  refunds: RefundResponse[] = [];
  isLoading = true;
  errorMessage = '';
  selectedRefundId: number | null = null;
  selectedStatus: RefundStatus | null = null;
  isUpdatingStatus = false;

  RefundStatus = RefundStatus;

  ngOnInit(): void {
    this.loadRefunds();
  }

  loadRefunds(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.refundService.getSellerRefunds().subscribe({
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

  openStatusModal(refundId: number, currentStatus: RefundStatus): void {
    this.selectedRefundId = refundId;
    this.selectedStatus = currentStatus;
  }

  closeStatusModal(): void {
    this.selectedRefundId = null;
    this.selectedStatus = null;
  }

  updateStatus(status: RefundStatus): void {
    if (!this.selectedRefundId) return;

    this.isUpdatingStatus = true;
    this.errorMessage = '';

    this.refundService.updateRefundStatus(this.selectedRefundId, status).subscribe({
      next: () => {
        this.isUpdatingStatus = false;
        this.closeStatusModal();
        this.loadRefunds(); // Reload to get updated data
      },
      error: (error) => {
        console.error('Error updating refund status:', error);
        this.errorMessage = error.message || 'Failed to update refund status';
        this.isUpdatingStatus = false;
      }
    });
  }

  viewRefundDetails(refundId: number): void {
    this.router.navigate(['/seller/refunds', refundId]);
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

  canUpdateStatus(status: string): boolean {
    return status.toUpperCase() === 'PENDING';
  }
}
