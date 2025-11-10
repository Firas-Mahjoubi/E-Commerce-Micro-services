import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const isAuth = authService.isAuthenticated();
  console.log('[authGuard] Checking authentication:', {
    isAuthenticated: isAuth,
    targetUrl: state.url,
    hasToken: !!authService.getAccessToken()
  });

  if (isAuth) {
    console.log('[authGuard] User authenticated, allowing access');
    return true;
  }

  console.log('[authGuard] User not authenticated, redirecting to login');
  // Redirect to login with return url
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Redirect to products if already logged in
  router.navigate(['/products']);
  return false;
};
