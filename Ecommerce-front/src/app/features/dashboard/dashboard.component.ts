import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: User | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    // Try to get user from current value first
    this.currentUser = this.authService.getCurrentUserValue();
    
    if (this.currentUser) {
      this.isLoading = false;
      return;
    }

    // If no user in memory, try to fetch from API
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load user data:', error);
        this.isLoading = false;
        // If failed to load user, redirect to login
        this.router.navigate(['/login']);
      }
    });
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if API call fails, redirect to login
        this.router.navigate(['/login']);
      }
    });
  }
}

