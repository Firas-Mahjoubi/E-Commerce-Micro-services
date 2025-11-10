import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService, User } from '../../../core/services/admin.service';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  editForm: FormGroup;
  loading = true;
  error = '';
  success = '';
  userId = '';
  user: User | null = null;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.editForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: [''],
      role: ['customer', Validators.required],
      enabled: [true]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (this.userId) {
      this.loadUser();
    }
  }

  loadUser(): void {
    this.loading = true;
    this.error = '';

    this.adminService.getUserById(this.userId).subscribe({
      next: (user: User) => {
        this.user = user;
        
        // Get the primary role
        const primaryRole = user.roles?.includes('admin') ? 'admin' :
                           user.roles?.includes('seller') ? 'seller' : 'customer';
        
        // Populate form with user data
        this.editForm.patchValue({
          username: user.username,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
          role: primaryRole,
          enabled: user.enabled
        });
        
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading user:', err);
        this.error = 'Failed to load user details';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.editForm.invalid || this.submitting) return;

    this.submitting = true;
    this.error = '';
    this.success = '';

    const formData = this.editForm.value;
    
    this.adminService.updateUser(this.userId, formData).subscribe({
      next: (updatedUser: User) => {
        this.success = 'User updated successfully!';
        this.submitting = false;
        
        // Redirect to user detail page after 1.5 seconds
        setTimeout(() => {
          this.router.navigate(['/admin/users', this.userId]);
        }, 1500);
      },
      error: (err: any) => {
        console.error('Error updating user:', err);
        this.error = err.error?.message || 'Failed to update user. Please try again.';
        this.submitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/users', this.userId]);
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}
