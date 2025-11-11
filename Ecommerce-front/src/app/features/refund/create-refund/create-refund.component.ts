import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService } from '@core/services/order.service';
import { RefundService } from '@core/services/refund.service';
import { AuthService } from '@core/services/auth.service';
import { OrderResponse, OrderItem } from '@core/models/order.model';
import { RefundRequest } from '@core/models/refund.model';

@Component({
  selector: 'app-create-refund',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-refund.component.html',
  styleUrls: ['./create-refund.component.css']
})
export class CreateRefundComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private refundService = inject(RefundService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  order: OrderResponse | null = null;
  refundForm!: FormGroup;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.initForm();
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId) {
      this.loadOrderDetails(+orderId);
    } else {
      this.errorMessage = 'Invalid order ID';
      this.isLoading = false;
    }
  }

  initForm(): void {
    this.refundForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(10)]],
      items: this.fb.array([])
    });
  }

  get itemsFormArray(): FormArray {
    return this.refundForm.get('items') as FormArray;
  }

  loadOrderDetails(orderId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getOrderByIdAndCustomer(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.initializeItemsForm(order.items);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        this.errorMessage = error.message || 'Failed to load order details';
        this.isLoading = false;
      }
    });
  }

  initializeItemsForm(items: OrderItem[]): void {
    items.forEach(item => {
      this.itemsFormArray.push(this.fb.group({
        productId: [item.productId],
        productName: ['Product ' + item.productId],
        quantity: [item.quantity],
        maxQuantity: [item.quantity],
        price: [item.price],
        selected: [false],
        refundQuantity: [0, [Validators.min(0)]],
        itemReason: ['']
      }));
    });
  }

  onItemSelectionChange(index: number): void {
    const itemGroup = this.itemsFormArray.at(index);
    const selected = itemGroup.get('selected')?.value;
    const maxQuantity = itemGroup.get('maxQuantity')?.value;

    if (selected) {
      itemGroup.get('refundQuantity')?.setValue(maxQuantity);
      itemGroup.get('refundQuantity')?.setValidators([Validators.required, Validators.min(1), Validators.max(maxQuantity)]);
      itemGroup.get('itemReason')?.setValidators([Validators.required, Validators.minLength(5)]);
    } else {
      itemGroup.get('refundQuantity')?.setValue(0);
      itemGroup.get('refundQuantity')?.clearValidators();
      itemGroup.get('itemReason')?.clearValidators();
      itemGroup.get('itemReason')?.setValue('');
    }

    itemGroup.get('refundQuantity')?.updateValueAndValidity();
    itemGroup.get('itemReason')?.updateValueAndValidity();
  }

  getSelectedItemsCount(): number {
    return this.itemsFormArray.controls.filter(
      control => control.get('selected')?.value
    ).length;
  }

  getTotalRefundAmount(): number {
    return this.itemsFormArray.controls.reduce((total, control) => {
      if (control.get('selected')?.value) {
        const quantity = control.get('refundQuantity')?.value || 0;
        const price = control.get('price')?.value || 0;
        return total + (quantity * price);
      }
      return total;
    }, 0);
  }

  canSubmit(): boolean {
    return this.refundForm.valid && this.getSelectedItemsCount() > 0;
  }

  submitRefund(): void {
    if (!this.canSubmit() || !this.order) {
      return;
    }

    const user = this.authService.getCurrentUserValue();
    if (!user || !user.id) {
      this.errorMessage = 'User not authenticated';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Get selected product IDs
    const selectedProductIds = this.itemsFormArray.controls
      .filter(control => control.get('selected')?.value)
      .map(control => control.get('productId')?.value);

    // Calculate total refund amount
    const refundAmount = this.getTotalRefundAmount();

    const refundRequest: RefundRequest = {
      orderId: this.order.id.toString(),
      customerId: user.id.toString(),
      reason: this.refundForm.get('reason')?.value,
      refundAmount: refundAmount,
      fullOrderRefund: selectedProductIds.length === this.order.items.length,
      productIds: selectedProductIds
    };

    console.log('Submitting refund request:', refundRequest);

    this.refundService.createRefund(refundRequest).subscribe({
      next: (response) => {
        console.log('Refund created successfully:', response);
        this.successMessage = 'Refund request submitted successfully!';
        this.isSubmitting = false;

        // Redirect to refunds list after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/refunds']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error creating refund:', error);
        this.errorMessage = error.message || 'Failed to create refund request';
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    if (this.order) {
      this.router.navigate(['/orders', this.order.id]);
    } else {
      this.router.navigate(['/orders']);
    }
  }
}
