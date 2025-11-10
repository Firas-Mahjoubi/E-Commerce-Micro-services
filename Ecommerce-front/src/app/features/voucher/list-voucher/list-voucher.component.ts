import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Voucher {
  code: string;
  description: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  active: boolean;
  applicableCategory?: string;
}

interface EditingVoucher extends Voucher {
  isEditing?: boolean;
}

@Component({
  selector: 'app-list-voucher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-voucher.component.html',
  styleUrl: './list-voucher.component.css'
})
export class ListVoucherComponent implements OnInit {
  private http = inject(HttpClient);
  public router = inject(Router);

  vouchers: EditingVoucher[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  editingVoucher: EditingVoucher | null = null;
  originalVoucher: Voucher | null = null;

  ngOnInit(): void {
    this.loadVouchers();
  }

  loadVouchers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<Voucher[]>('http://localhost:8090/api/voucher').subscribe({
      next: (data) => {
        console.log('[ListVoucherComponent] Loaded vouchers:', data);
        this.vouchers = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[ListVoucherComponent] Load error:', error);
        this.errorMessage = error.error?.message || 'Failed to load vouchers';
        this.isLoading = false;
      }
    });
  }

  addVoucher(): void {
    this.router.navigate(['/seller/vouchers/add']);
  }

  startEdit(voucher: EditingVoucher): void {
    // Cancel any existing edit
    this.cancelEdit();

    // Store original values for cancel operation
    this.originalVoucher = { ...voucher };

    // Mark this voucher as being edited
    voucher.isEditing = true;
    this.editingVoucher = voucher;
  }

  cancelEdit(): void {
    if (this.editingVoucher && this.originalVoucher) {
      // Restore original values
      Object.assign(this.editingVoucher, this.originalVoucher);
      this.editingVoucher.isEditing = false;
    }
    this.editingVoucher = null;
    this.originalVoucher = null;
  }

  saveEdit(voucher: EditingVoucher): void {
    // Validate fields
    if (!voucher.description || !voucher.discountPercentage || !voucher.startDate || !voucher.endDate) {
      this.errorMessage = 'Please fill in all required fields';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (voucher.discountPercentage <= 0 || voucher.discountPercentage > 100) {
      this.errorMessage = 'Discount percentage must be between 1 and 100';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    const payload = {
      code: voucher.code,
      description: voucher.description,
      discountPercentage: voucher.discountPercentage,
      startDate: voucher.startDate,
      endDate: voucher.endDate,
      active: voucher.active,
      applicableCategory: voucher.applicableCategory || null
    };

    this.http.put(`http://localhost:8090/api/voucher/${voucher.code}`, payload).subscribe({
      next: () => {
        console.log('[ListVoucherComponent] Voucher updated:', voucher.code);
        this.successMessage = 'Voucher updated successfully!';
        voucher.isEditing = false;
        this.editingVoucher = null;
        this.originalVoucher = null;
        this.loadVouchers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('[ListVoucherComponent] Update error:', error);
        this.errorMessage = error.error?.message || 'Failed to update voucher';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  editVoucher(code: string): void {
    this.router.navigate(['/seller/vouchers/edit', code]);
  }

  deleteVoucher(code: string): void {
    if (!confirm(`Are you sure you want to delete voucher "${code}"?`)) {
      return;
    }

    this.http.delete(`http://localhost:8090/api/voucher/${code}`).subscribe({
      next: () => {
        console.log('[ListVoucherComponent] Voucher deleted:', code);
        this.successMessage = 'Voucher deleted successfully!';
        this.loadVouchers(); // Reload the list
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('[ListVoucherComponent] Delete error:', error);
        this.errorMessage = error.error?.message || 'Failed to delete voucher';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  toggleActive(voucher: Voucher): void {
    const updatedVoucher = { ...voucher, active: !voucher.active };

    this.http.put(`http://localhost:8090/api/voucher/${voucher.code}`, updatedVoucher).subscribe({
      next: () => {
        console.log('[ListVoucherComponent] Voucher status updated:', voucher.code);
        this.successMessage = `Voucher ${voucher.active ? 'deactivated' : 'activated'} successfully!`;
        this.loadVouchers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('[ListVoucherComponent] Update error:', error);
        this.errorMessage = error.error?.message || 'Failed to update voucher';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  isExpired(endDate: string): boolean {
    return new Date(endDate) < new Date();
  }

  isActive(startDate: string, endDate: string): boolean {
    const now = new Date();
    return new Date(startDate) <= now && new Date(endDate) >= now;
  }
}
