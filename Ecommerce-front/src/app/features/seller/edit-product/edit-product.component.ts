import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  skuCode: string;
  imageUrls?: string[];
  imageUrl?: string;
  category?: string;
  stockQuantity: number;
  active: boolean;
  sellerId?: string;
}

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css']
})
export class EditProductComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  productForm!: FormGroup;
  productId: string = '';
  sellerId: string = ''; // Store sellerId from loaded product
  isLoading = false;
  isSaving = false;
  isUploading = false;
  successMessage = '';
  errorMessage = '';
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  existingImages: string[] = [];
  uploadedImageUrls: string[] = [];

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    this.initForm();
    this.loadProduct();
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

  removeNewImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  removeExistingImage(index: number) {
    this.existingImages.splice(index, 1);
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

  loadProduct() {
    this.isLoading = true;
    this.http.get<Product>(`http://localhost:8090/api/product/${this.productId}`)
      .subscribe({
        next: (product) => {
          // Store sellerId from product
          this.sellerId = product.sellerId || '';
          
          // Store existing images
          if (product.imageUrls && product.imageUrls.length > 0) {
            this.existingImages = [...product.imageUrls];
          }

          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            price: product.price,
            skuCode: product.skuCode,
            category: product.category,
            stockQuantity: product.stockQuantity,
            active: product.active !== undefined ? product.active : true
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.errorMessage = 'Failed to load product. Please try again.';
          this.isLoading = false;
        }
      });
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    if (this.existingImages.length === 0 && this.selectedFiles.length === 0) {
      this.errorMessage = 'Please provide at least one product image';
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Upload new images if any
    const uploadPromise = this.selectedFiles.length > 0 
      ? this.uploadImages() 
      : Promise.resolve([]);

    uploadPromise.then(newImageUrls => {
      // Combine existing and new image URLs
      const allImageUrls = [...this.existingImages, ...newImageUrls];

      const formValue = this.productForm.value;
      
      // Prepare the update payload
      const updateData = {
        name: formValue.name,
        description: formValue.description,
        price: formValue.price,
        skuCode: formValue.skuCode,
        imageUrls: allImageUrls,
        category: formValue.category,
        stockQuantity: formValue.stockQuantity,
        active: formValue.active,
        sellerId: this.sellerId // Include sellerId from loaded product
      };

      console.log('[EditProductComponent] Updating product:', updateData);

      this.http.put(`http://localhost:8090/api/product/${this.productId}`, updateData)
        .subscribe({
          next: (response) => {
            console.log('[EditProductComponent] Update response:', response);
            this.successMessage = 'Product updated successfully!';
            this.isSaving = false;
            
            // Redirect to products list after 1.5 seconds
            setTimeout(() => {
              this.router.navigate(['/seller/products']);
            }, 1500);
          },
          error: (error) => {
            console.error('[EditProductComponent] Update error:', error);
            this.errorMessage = error.error?.message || 'Failed to update product. Please try again.';
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

  get name() { return this.productForm.get('name'); }
  get description() { return this.productForm.get('description'); }
  get price() { return this.productForm.get('price'); }
  get skuCode() { return this.productForm.get('skuCode'); }
  get category() { return this.productForm.get('category'); }
  get stockQuantity() { return this.productForm.get('stockQuantity'); }
  get active() { return this.productForm.get('active'); }
}
