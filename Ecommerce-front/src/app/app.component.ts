import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SellerNavbarComponent } from './shared/components/seller-navbar/seller-navbar.component';
import { AdminNavbarComponent } from './shared/components/admin-navbar/admin-navbar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, NavbarComponent, SellerNavbarComponent, AdminNavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private router = inject(Router);
  title = 'E-Commerce Platform';
  showNavbar = false;
  showSellerNavbar = false;
  showAdminNavbar = false;

  constructor() {
    // Determine which navbar to show based on current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.url;
        
        // Show seller navbar on seller routes
        this.showSellerNavbar = url.includes('/seller');
        
        // Show admin navbar on admin routes
        this.showAdminNavbar = url.includes('/admin');
        
        // Show customer navbar on customer pages (not on auth/seller/admin pages)
        this.showNavbar = !url.includes('/login') && 
                         !url.includes('/register') && 
                         !url.includes('/seller') && 
                         !url.includes('/admin');
      });
  }
}
