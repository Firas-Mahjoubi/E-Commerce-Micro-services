import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-seller-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="seller-navbar">
      <div class="navbar-container">
        <div class="navbar-left">
          <a routerLink="/seller/dashboard" class="logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>Seller Portal</span>
          </a>

          <div class="nav-links">
            <a routerLink="/seller/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              Dashboard
            </a>
            <a routerLink="/seller/products" routerLinkActive="active">
              Products
            </a>
            <a routerLink="/seller/reviews" routerLinkActive="active">
              Reviews
            <a routerLink="/seller/vouchers" routerLinkActive="active">
              Vouchers
            </a>
            <a routerLink="/seller/vouchers/stats" routerLinkActive="active">
              Statistics
            </a>
          </div>
        </div>

        <div class="navbar-right">
          <div class="user-menu">
            <button class="user-btn" (click)="toggleDropdown()">
              <div class="avatar">{{sellerInitials}}</div>
              <span class="user-name">{{sellerName}}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <div class="dropdown-menu" [class.show]="isDropdownOpen">
              <a routerLink="/seller/profile" class="dropdown-item" (click)="closeDropdown()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Profile
              </a>
              <a routerLink="/dashboard" class="dropdown-item" (click)="closeDropdown()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                Shop as Customer
              </a>
              <div class="dropdown-divider"></div>
              <button (click)="logout()" class="dropdown-item logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .seller-navbar {
      background: white;
      border-bottom: 1px solid #e9ecef;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
      height: 70px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 48px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      font-weight: 700;
      color: #667eea;
      text-decoration: none;
    }

    .nav-links {
      display: flex;
      gap: 8px;
    }

    .nav-links a {
      padding: 10px 20px;
      color: #666;
      text-decoration: none;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .nav-links a:hover {
      background: #f8f9fa;
      color: #667eea;
    }

    .nav-links a.active {
      background: #667eea15;
      color: #667eea;
    }

    .user-menu {
      position: relative;
    }

    .user-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .user-btn:hover {
      border-color: #667eea;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }

    .user-name {
      font-weight: 600;
      color: #333;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      min-width: 220px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s;
      z-index: 1000;
    }

    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      color: #333;
      text-decoration: none;
      transition: all 0.2s;
      font-weight: 500;
      border: none;
      background: none;
      width: 100%;
      cursor: pointer;
      font-size: 14px;
    }

    .dropdown-item:first-child {
      border-radius: 12px 12px 0 0;
    }

    .dropdown-item:last-child {
      border-radius: 0 0 12px 12px;
    }

    .dropdown-item:hover {
      background: #f8f9fa;
      color: #667eea;
    }

    .dropdown-item.logout {
      color: #f56565;
    }

    .dropdown-item.logout:hover {
      background: #f5656515;
    }

    .dropdown-divider {
      height: 1px;
      background: #e9ecef;
      margin: 8px 0;
    }

    @media (max-width: 768px) {
      .navbar-left {
        gap: 24px;
      }

      .nav-links {
        display: none;
      }

      .user-name {
        display: none;
      }
    }
  `]
})
export class SellerNavbarComponent implements OnInit {
  sellerName = 'Seller';
  sellerInitials = 'S';
  isDropdownOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.sellerName = user.firstName || user.username || 'Seller';
        this.sellerInitials = this.getInitials(this.sellerName);
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}
