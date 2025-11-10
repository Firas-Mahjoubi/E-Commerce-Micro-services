import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SellerNavbarComponent } from '../../../shared/components/seller-navbar/seller-navbar.component';
import { AuthService } from '@core/services/auth.service';

interface AddProductRequest {
  name: string;
  description: string;
  price: number;
  skuCode: string;
  imageUrls: string[];
  category: string;
  stockQuantity: number;
  active: boolean;
  sellerId: string;
}

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SellerNavbarComponent],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  productForm!: FormGroup;
  isSaving = false;
  isUploading = false;
  successMessage = '';
  errorMessage = '';
  sellerId = '';
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  uploadedImageUrls: string[] = [];

  ngOnInit() {
    // Get seller ID from current user
    this.authService.currentUser$.subscribe(user => {
      if (user?.id) {
        this.sellerId = user.id;
      }
    });

    this.initForm();
  }

  initForm() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      skuCode: ['', [Validators.required]],
      category: ['', [Validators.required]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      active: [true]
    });
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      // Validate file types
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          this.errorMessage = 'Only image files are allowed';
          return;
        }
      }

      // Add to selected files
      this.selectedFiles = Array.from(files);
      
      // Generate previews
      this.imagePreviews = [];
      this.selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    if (this.uploadedImageUrls.length > index) {
      this.uploadedImageUrls.splice(index, 1);
    }
  }

  async uploadImages(): Promise<string[]> {
    if (this.selectedFiles.length === 0) {
      return [];
    }

    this.isUploading = true;
    const uploadedUrls: string[] = [];

    try {
      for (const file of this.selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response: any = await this.http.post('http://localhost:8090/api/product/upload', formData).toPromise();
        if (response && response.url) {
          uploadedUrls.push(response.url);
        }
      }
      this.isUploading = false;
      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      this.isUploading = false;
      throw error;
    }
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    if (!this.sellerId) {
      this.errorMessage = 'Seller ID not found. Please log in again.';
      return;
    }

    if (this.selectedFiles.length === 0) {
      this.errorMessage = 'Please select at least one product image';
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    // First upload images
    this.uploadImages().then(imageUrls => {
      const formValue = this.productForm.value;
      
      // Prepare the product data with sellerId and uploaded image URLs
      const productData: AddProductRequest = {
        name: formValue.name,
        description: formValue.description,
        price: formValue.price,
        skuCode: formValue.skuCode,
        imageUrls: imageUrls,
        category: formValue.category,
        stockQuantity: formValue.stockQuantity,
        active: formValue.active,
        sellerId: this.sellerId
      };

      console.log('[AddProductComponent] Creating product:', productData);

      this.http.post('http://localhost:8090/api/product', productData)
        .subscribe({
          next: (response) => {
            console.log('[AddProductComponent] Create response:', response);
            this.successMessage = 'Product created successfully!';
            this.isSaving = false;
            
            // Redirect to products list after 1.5 seconds
            setTimeout(() => {
              this.router.navigate(['/seller/products']);
            }, 1500);
          },
          error: (error) => {
            console.error('[AddProductComponent] Create error:', error);
            this.errorMessage = error.error?.message || 'Failed to create product. Please try again.';
            this.isSaving = false;
          }
        });
    }).catch(error => {
      this.errorMessage = 'Failed to upload images. Please try again.';
      this.isSaving = false;
    });
  }

  cancel() {
    this.router.navigate(['/seller/products']);
  }

  // Auto-generate SKU based on product name and category
  generateSKU() {
    const name = this.productForm.get('name')?.value;
    const category = this.productForm.get('category')?.value;
    
    if (name && category) {
      const namePart = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
      const categoryPart = category.substring(0, 3).toUpperCase();
      const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const sku = `${categoryPart}-${namePart}-${randomPart}`;
      this.productForm.patchValue({ skuCode: sku });
    }
  }

  get name() { return this.productForm.get('name'); }
  get description() { return this.productForm.get('description'); }
  get price() { return this.productForm.get('price'); }
  get skuCode() { return this.productForm.get('skuCode'); }
  get category() { return this.productForm.get('category'); }
  get stockQuantity() { return this.productForm.get('stockQuantity'); }
  get active() { return this.productForm.get('active'); }
}
