import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';

interface AddVoucherRequest {
  code: string;
  description: string;
  discountPercentage: number;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
  applicableCategory?: string;
}

@Component({
  selector: 'app-add-voucher',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-voucher.component.html',
  styleUrls: ['./add-voucher.component.css']
})
export class AddVoucherComponent implements OnInit {
  private fb = inject(FormBuilder);
  public router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  voucherForm!: FormGroup;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.voucherForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      discountPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      active: [true],
      applicableCategory: ['']
    });
  }

  private toLocalDateTimeString(value: string): string | null {
    if (!value) return null;
    const d = new Date(value);
    const iso = d.toISOString();
    return iso.endsWith('Z') ? iso.slice(0, -1) : iso;
  }

  onSubmit() {
    if (this.voucherForm.invalid) {
      this.voucherForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const v = this.voucherForm.value;
    const payload: AddVoucherRequest = {
      code: v.code,
      description: v.description,
      discountPercentage: Number(v.discountPercentage),
      startDate: this.toLocalDateTimeString(v.startDate),
      endDate: this.toLocalDateTimeString(v.endDate),
      active: v.active,
      applicableCategory: v.applicableCategory || undefined
    };

    // Use the same gateway URL the working AddProduct uses (8090)
    const url = 'http://localhost:8090/api/voucher';

    this.http.post(url, payload).subscribe({
      next: (response) => {
        console.log('[AddVoucherComponent] Create response:', response);
        this.successMessage = 'Voucher created successfully!';
        this.isSaving = false;
        setTimeout(() => {
          this.router.navigate(['/seller/vouchers']);
        }, 1200);
      },
      error: (error) => {
        console.error('[AddVoucherComponent] Create error:', error);
        this.errorMessage = error.error?.message || 'Failed to create voucher. Please try again.';
        this.isSaving = false;
      }
    });
  }

  // helpers for template
  get code() { return this.voucherForm.get('code'); }
  get description() { return this.voucherForm.get('description'); }
  get discountPercentage() { return this.voucherForm.get('discountPercentage'); }
  get startDate() { return this.voucherForm.get('startDate'); }
  get endDate() { return this.voucherForm.get('endDate'); }
  get active() { return this.voucherForm.get('active'); }
  get applicableCategory() { return this.voucherForm.get('applicableCategory'); }
}
