import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="admin-navbar">
      <div class="navbar-container">
        <!-- Brand -->
        <div class="navbar-brand">
          <i class="fas fa-shield-alt"></i>
          <span>Admin Panel</span>
        </div>

        <!-- Navigation Links -->
        <div class="navbar-links">
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link">
            <i class="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-link">
            <i class="fas fa-users"></i>
            <span>All Users</span>
          </a>
          <a routerLink="/admin/customers" routerLinkActive="active" class="nav-link">
            <i class="fas fa-shopping-cart"></i>
            <span>Customers</span>
          </a>
          <a routerLink="/admin/sellers" routerLinkActive="active" class="nav-link">
            <i class="fas fa-store"></i>
            <span>Sellers</span>
          </a>
        </div>

        <!-- User Menu -->
        <div class="navbar-user">
          <div class="user-dropdown" (click)="toggleDropdown()">
            <div class="user-avatar">
              {{ getInitials() }}
            </div>
            <span class="user-name">{{ currentUser?.firstName || 'Admin' }}</span>
            <i class="fas fa-chevron-down"></i>
          </div>

          <!-- Dropdown Menu -->
          <div class="dropdown-menu" [class.show]="dropdownOpen">
            <a routerLink="/admin/profile" (click)="closeDropdown()" class="dropdown-item">
              <i class="fas fa-user-circle"></i>
              Profile
            </a>
            <a routerLink="/products" (click)="closeDropdown()" class="dropdown-item">
              <i class="fas fa-store"></i>
              View Store
            </a>
            <div class="dropdown-divider"></div>
            <button (click)="logout()" class="dropdown-item logout">
              <i class="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .admin-navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      height: 70px;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: white;
      font-size: 1.3rem;
      font-weight: 700;
      text-decoration: none;
    }

    .navbar-brand i {
      font-size: 1.5rem;
    }

    .navbar-links {
      display: flex;
      gap: 0.5rem;
      flex: 1;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s;
      font-weight: 500;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.15);
      color: white;
    }

    .nav-link.active {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .navbar-user {
      position: relative;
    }

    .user-dropdown {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.3s;
      color: white;
    }

    .user-dropdown:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .user-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: white;
      color: #667eea;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.95rem;
    }

    .user-name {
      font-weight: 600;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      min-width: 220px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s;
    }

    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      color: #4a5568;
      text-decoration: none;
      transition: all 0.2s;
      border: none;
      background: none;
      width: 100%;
      cursor: pointer;
      font-size: 0.95rem;
    }

    .dropdown-item:first-child {
      border-radius: 12px 12px 0 0;
    }

    .dropdown-item:last-child {
      border-radius: 0 0 12px 12px;
    }

    .dropdown-item:hover {
      background: #f7fafc;
      color: #667eea;
    }

    .dropdown-item.logout {
      color: #e53e3e;
    }

    .dropdown-item.logout:hover {
      background: #fff5f5;
      color: #c53030;
    }

    .dropdown-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 0.5rem 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .navbar-container {
        padding: 0 1rem;
        gap: 1rem;
      }

      .navbar-links {
        display: none;
      }

      .nav-link span {
        display: none;
      }

      .user-name {
        display: none;
      }
    }
  `]
})
export class AdminNavbarComponent {
  currentUser: any;
  dropdownOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  getInitials(): string {
    if (this.currentUser) {
      const firstName = this.currentUser.firstName || '';
      const lastName = this.currentUser.lastName || '';
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 
             this.currentUser.username?.charAt(0).toUpperCase() || 'A';
    }
    return 'A';
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.closeDropdown();
      this.authService.logout().subscribe({
        next: () => {
          console.log('Logout successful');
        },
        error: (err) => {
          console.error('Logout error (but clearing local data):', err);
          // Navigation already handled in authService.clearAuthData()
        }
      });
    }
  }
}
