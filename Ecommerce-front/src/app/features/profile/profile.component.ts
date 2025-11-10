import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/models/user.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  currentUser: User | null = null;
  profileForm!: FormGroup;
  isEditing = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.initForm();
    });
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      username: [{ value: this.currentUser?.username || '', disabled: true }],
      email: [{ value: this.currentUser?.email || '', disabled: true }],
      firstName: [this.currentUser?.firstName || '', [Validators.required]],
      lastName: [this.currentUser?.lastName || '', [Validators.required]],
      phone: [this.currentUser?.phone || '', [Validators.pattern(/^\+?[\d\s-()]+$/)]]
    });
  }

  get userInitials(): string {
    if (!this.currentUser) return 'U';
    const firstName = this.currentUser.firstName || this.currentUser.username || '';
    const lastName = this.currentUser.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.successMessage = '';
    this.errorMessage = '';
    
    if (!this.isEditing) {
      // Reset form when canceling
      this.initForm();
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const updateData = {
      firstName: this.profileForm.get('firstName')?.value,
      lastName: this.profileForm.get('lastName')?.value,
      phone: this.profileForm.get('phone')?.value
    };

    console.log('[ProfileComponent] Updating user profile:', updateData);

    this.http.put('http://localhost:8090/api/users/me', updateData).subscribe({
      next: (response: any) => {
        console.log('[ProfileComponent] Update response:', response);
        this.successMessage = 'Profile updated successfully!';
        this.isEditing = false;
        this.isLoading = false;
        
        // Update local user data from response
        if (this.currentUser && response.user) {
          this.currentUser = {
            ...this.currentUser,
            firstName: response.user.first_name || response.user.firstName,
            lastName: response.user.last_name || response.user.lastName,
            phone: response.user.phone
          };
          this.initForm(); // Reinitialize form with new data
        }
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('[ProfileComponent] Update error:', error);
        this.errorMessage = error.error?.message || error.message || 'Failed to update profile. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
