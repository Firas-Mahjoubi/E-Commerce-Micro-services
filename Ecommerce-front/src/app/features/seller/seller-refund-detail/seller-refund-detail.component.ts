import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RefundService } from '@core/services/refund.service';
import { RefundResponse, RefundStatus } from '@core/models/refund.model';

@Component({
  selector: 'app-seller-refund-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './seller-refund-detail.component.html',
  styleUrls: ['./seller-refund-detail.component.css']
})
export class SellerRefundDetailComponent implements OnInit {
  private refundService = inject(RefundService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  refund: RefundResponse | null = null;
  isLoading = true;
  errorMessage = '';
  isUpdatingStatus = false;
  updateSuccess = false;
  selectedStatus: RefundStatus | null = null;

  RefundStatus = RefundStatus;

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

    this.refundService.getSellerRefundById(refundId).subscribe({
      next: (refund) => {
        this.refund = refund;
        this.isLoading = false;
        console.log('Loaded refund details:', refund);
      },
      error: (error) => {
        console.error('Error loading refund details:', error);
        this.errorMessage = error.message || 'Failed to load refund details';
        this.isLoading = false;
      }
    });
  }

  openStatusModal(status: RefundStatus): void {
    this.selectedStatus = status;
  }

  closeStatusModal(): void {
    this.selectedStatus = null;
  }

  updateStatus(): void {
    if (!this.refund || !this.selectedStatus) return;

    this.isUpdatingStatus = true;
    this.errorMessage = '';

    this.refundService.updateRefundStatus(this.refund.refundId, this.selectedStatus).subscribe({
      next: (updatedRefund) => {
        this.updateSuccess = true;
        this.isUpdatingStatus = false;
        this.closeStatusModal();
        this.refund = updatedRefund;

        // Show success message for 2 seconds
        setTimeout(() => {
          this.updateSuccess = false;
        }, 2000);
      },
      error: (error) => {
        console.error('Error updating refund status:', error);
        this.errorMessage = error.message || 'Failed to update refund status';
        this.isUpdatingStatus = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/seller/refunds']);
  }

  viewOrder(): void {
    if (this.refund) {
      this.router.navigate(['/seller/orders', this.refund.orderId]);
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

  canUpdateStatus(): boolean {
    return this.refund !== null && this.refund.status.toUpperCase() === 'PENDING';
  }
}
