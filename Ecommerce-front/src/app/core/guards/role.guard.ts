import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

/**
 * Role Guard - Protects routes based on user role
 */
export const roleGuard = (requiredRole: string): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    if (authService.hasRole(requiredRole)) {
      return true;
    }

    // Redirect to appropriate dashboard based on user's actual role
    console.warn('[RoleGuard] User does not have required role:', requiredRole);
    authService.redirectByRole();
    return false;
  };
};

/**
 * Seller Guard
 */
export const sellerGuard: CanActivateFn = roleGuard('seller');

/**
 * Admin Guard
 */
export const adminGuard: CanActivateFn = roleGuard('admin');

/**
 * Customer Guard
 */
export const customerGuard: CanActivateFn = roleGuard('customer');
