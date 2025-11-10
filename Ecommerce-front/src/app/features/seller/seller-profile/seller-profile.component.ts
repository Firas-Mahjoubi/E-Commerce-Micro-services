import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: string;
}

@Component({
  selector: 'app-seller-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seller-profile.component.html',
  styleUrls: ['./seller-profile.component.css']
})
export class SellerProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  user: User | null = null;
  isLoading = false;
  isSaving = false;
  isEditMode = false;
  showPasswordForm = false;
  successMessage = '';
  errorMessage = '';
  passwordSuccessMessage = '';
  passwordErrorMessage = '';

  ngOnInit() {
    this.initForms();
    this.loadUserProfile();
  }

  initForms() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  loadUserProfile() {
    this.isLoading = true;
    const userData = localStorage.getItem('user');
    
    if (userData) {
      this.user = JSON.parse(userData);
      
      // Fetch fresh data from backend
      this.http.get<User>(`http://localhost:3000/api/users/profile`)
        .subscribe({
          next: (user) => {
            this.user = user;
            localStorage.setItem('user', JSON.stringify(user));
            this.populateForm();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading profile:', error);
            // Use cached data if API fails
            this.populateForm();
            this.isLoading = false;
          }
        });
    } else {
      this.isLoading = false;
      this.router.navigate(['/login']);
    }
  }

  populateForm() {
    if (this.user) {
      this.profileForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        phone: this.user.phone || '',
        address: this.user.address || ''
      });
    }
  }

  enableEditMode() {
    this.isEditMode = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEdit() {
    this.isEditMode = false;
    this.populateForm();
    this.successMessage = '';
    this.errorMessage = '';
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const updateData = this.profileForm.value;

    this.http.put<User>('http://localhost:3000/api/users/profile', updateData)
      .subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.successMessage = 'Profile updated successfully!';
          this.isEditMode = false;
          this.isSaving = false;
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.errorMessage = error.error?.message || 'Failed to update profile. Please try again.';
          this.isSaving = false;
        }
      });
  }

  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    this.passwordForm.reset();
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';
  }

  onPasswordSubmit() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';

    const passwordData = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.http.put('http://localhost:3000/api/users/change-password', passwordData)
      .subscribe({
        next: () => {
          this.passwordSuccessMessage = 'Password changed successfully!';
          this.passwordForm.reset();
          this.isSaving = false;
          
          setTimeout(() => {
            this.showPasswordForm = false;
            this.passwordSuccessMessage = '';
          }, 2000);
        },
        error: (error) => {
          console.error('Error changing password:', error);
          this.passwordErrorMessage = error.error?.message || 'Failed to change password. Please check your current password.';
          this.isSaving = false;
        }
      });
  }

  getInitials(): string {
    if (this.user) {
      return `${this.user.firstName.charAt(0)}${this.user.lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  }
}
