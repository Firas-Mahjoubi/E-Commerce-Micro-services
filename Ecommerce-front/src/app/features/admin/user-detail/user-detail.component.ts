import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService, User } from '../../../core/services/admin.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  loading = true;
  error = '';
  userId = '';

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

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
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading user:', err);
        this.error = 'Failed to load user details';
        this.loading = false;
      }
    });
  }

  getInitials(): string {
    if (!this.user) return '?';
    const firstName = this.user.firstName || '';
    const lastName = this.user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 
           this.user.username?.charAt(0).toUpperCase() || '?';
  }

  getRoleBadgeClass(roles: string[]): string {
    if (roles?.includes('admin')) return 'badge-admin';
    if (roles?.includes('seller')) return 'badge-seller';
    return 'badge-customer';
  }

  getRoleDisplay(roles: string[]): string {
    if (roles?.includes('admin')) return 'Admin';
    if (roles?.includes('seller')) return 'Seller';
    return 'Customer';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  editUser(): void {
    this.router.navigate(['/admin/users/edit', this.userId]);
  }

  deleteUser(): void {
    if (!this.user) return;
    
    if (confirm(`Are you sure you want to delete user "${this.user.username}"? This action cannot be undone.`)) {
      this.adminService.deleteUser(this.userId).subscribe({
        next: () => {
          alert('User deleted successfully');
          this.router.navigate(['/admin/users']);
        },
        error: (err: any) => {
          console.error('Error deleting user:', err);
          alert('Failed to delete user');
        }
      });
    }
  }

  toggleStatus(): void {
    if (!this.user) return;
    
    const newStatus = !this.user.enabled;
    const action = newStatus ? 'enable' : 'disable';
    
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      this.adminService.updateUser(this.userId, { enabled: newStatus }).subscribe({
        next: (updatedUser: User) => {
          this.user = updatedUser;
          alert(`User ${action}d successfully`);
        },
        error: (err: any) => {
          console.error('Error updating user status:', err);
          alert(`Failed to ${action} user`);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}
