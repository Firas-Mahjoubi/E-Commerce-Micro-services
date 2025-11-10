import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  console.log('[authInterceptor] Request URL:', req.url);
  console.log('[authInterceptor] Has token:', !!token);

  // Clone request and add authorization header if token exists
  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('[authInterceptor] Added Authorization header');
  }

  return next(req);
};
