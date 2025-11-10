import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);

  currentUser: User | null = null;
  cartItemsCount = 0;
  isMenuOpen = false;
  isProfileDropdownOpen = false;

  constructor() {
    // Subscribe to current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Subscribe to cart updates
    this.cartService.cart$.subscribe(cart => {
      this.cartItemsCount = cart.totalItems;
    });
  }

  get userInitials(): string {
    if (!this.currentUser) return 'U';
    const firstName = this.currentUser.firstName || this.currentUser.username || '';
    const lastName = this.currentUser.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  closeDropdowns(): void {
    this.isMenuOpen = false;
    this.isProfileDropdownOpen = false;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Even if API call fails, still navigate to login
        this.router.navigate(['/login']);
      }
    });
  }
}
