import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService, User } from '../../../core/services/admin.service';

interface DashboardStats {
  totalUsers: number;
  totalCustomers: number;
  totalSellers: number;
  totalAdmins: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsers: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalUsers: 0,
    totalCustomers: 0,
    totalSellers: 0,
    totalAdmins: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    activeUsers: 0
  };

  recentUsers: any[] = [];
  loading = true;
  error = '';
  currentUser: any;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    // Load all users for statistics
    this.adminService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.calculateStats(users);
        // Get 5 most recent users
        this.recentUsers = users
          .sort((a: User, b: User) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading dashboard data:', err);
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      }
    });
  }

  calculateStats(users: any[]): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    this.stats.totalUsers = users.length;
    this.stats.totalCustomers = users.filter(u => u.roles?.includes('customer')).length;
    this.stats.totalSellers = users.filter(u => u.roles?.includes('seller')).length;
    this.stats.totalAdmins = users.filter(u => u.roles?.includes('admin')).length;
    
    this.stats.newUsersToday = users.filter(u => new Date(u.createdAt) >= today).length;
    this.stats.newUsersThisWeek = users.filter(u => new Date(u.createdAt) >= weekAgo).length;
    this.stats.newUsersThisMonth = users.filter(u => new Date(u.createdAt) >= monthAgo).length;
    
    // For now, consider users who logged in within last 30 days as active
    this.stats.activeUsers = users.filter(u => {
      if (!u.lastLogin) return false;
      return new Date(u.lastLogin) >= monthAgo;
    }).length;
  }

  getInitials(user: any): string {
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

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }
}
