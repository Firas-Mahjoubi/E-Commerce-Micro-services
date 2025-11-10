import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, User } from '../../../core/services/admin.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  error = '';
  pageTitle = 'User Management';
  pageSubtitle = 'View and manage all user accounts';
  
  // Filters
  searchTerm = '';
  roleFilter = 'all';
  statusFilter = 'all';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check the current route to set the default role filter
    const url = this.router.url;
    if (url.includes('/admin/customers')) {
      this.roleFilter = 'customer';
      this.pageTitle = 'Customer Management';
      this.pageSubtitle = 'View and manage customer accounts';
    } else if (url.includes('/admin/sellers')) {
      this.roleFilter = 'seller';
      this.pageTitle = 'Seller Management';
      this.pageSubtitle = 'View and manage seller accounts';
    }
    
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    this.adminService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
        this.error = 'Failed to load users';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.users];

    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.username?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.firstName?.toLowerCase().includes(search) ||
        user.lastName?.toLowerCase().includes(search)
      );
    }

    // Role filter
    if (this.roleFilter !== 'all') {
      filtered = filtered.filter(user => user.roles?.includes(this.roleFilter));
    }

    // Status filter
    if (this.statusFilter !== 'all') {
      const isActive = this.statusFilter === 'active';
      filtered = filtered.filter(user => user.enabled === isActive);
    }

    this.filteredUsers = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onRoleFilterChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  getInitials(user: User): string {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.username?.charAt(0).toUpperCase() || '?';
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

  getStatusBadgeClass(enabled: boolean): string {
    return enabled ? 'badge-active' : 'badge-inactive';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  viewUser(userId: string): void {
    this.router.navigate(['/admin/users', userId]);
  }

  editUser(userId: string): void {
    this.router.navigate(['/admin/users/edit', userId]);
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          alert('User deleted successfully');
          this.loadUsers();
        },
        error: (err: any) => {
          console.error('Error deleting user:', err);
          alert('Failed to delete user');
        }
      });
    }
  }

  getEndItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredUsers.length);
  }
}
