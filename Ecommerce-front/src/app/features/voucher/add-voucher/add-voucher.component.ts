import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-add-voucher',
  templateUrl: './add-voucher.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  styleUrls: ['./add-voucher.component.css']
})
export class AddVoucherComponent implements OnInit {
  voucherForm!: FormGroup;
  submitting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.voucherForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required]],
      discountPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      active: [true],
      applicableCategory: ['']
    });
  }

  // changed getter: return typed map so template can use f['discountPercentage'] or f.discountPercentage safely
  get f(): { [key: string]: AbstractControl } {
    return this.voucherForm.controls as { [key: string]: AbstractControl };
  }

  onSubmit(): void {
    this.error = null;
    if (this.voucherForm.invalid) {
      this.voucherForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const payload = {
      ...this.voucherForm.value,
      startDate: this.toLocalDateTimeString(this.voucherForm.value.startDate),
      endDate: this.toLocalDateTimeString(this.voucherForm.value.endDate)
    };

    // Use full backend URL while debugging (adjust port if your backend runs on a different port)
    const url = 'http://localhost:8094/api/voucher';

    console.log('Creating voucher payload:', payload);

    this.http.post(url, payload, { observe: 'response', headers: { 'Content-Type': 'application/json' } })
      .subscribe({
        next: (resp) => {
          console.log('Create voucher response', resp);
          this.submitting = false;
          // adjust navigation as needed
          this.router.navigate(['/vouchers']);
        },
        error: (err) => {
          console.error('Create voucher error', err);
          this.submitting = false;
          // Prefer server-provided message; fallback to status text
          if (err?.error) {
            // backend might return validation object or message string
            this.error = typeof err.error === 'string' ? err.error : (err.error.message || JSON.stringify(err.error));
          } else {
            this.error = err.statusText || 'Failed to create voucher';
          }
        }
      });
  }

  private toLocalDateTimeString(value: string): string | null {
    if (!value) return null;
    // when using <input type="datetime-local"> the value is local without timezone
    // send as-is or convert to ISO if backend expects it. Here we send ISO without timezone offset.
    const d = new Date(value);
    // remove trailing 'Z' to mimic LocalDateTime (optional)
    const iso = d.toISOString();
    return iso.endsWith('Z') ? iso.slice(0, -1) : iso;
  }
}
