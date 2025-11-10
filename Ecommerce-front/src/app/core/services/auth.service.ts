import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse 
} from '@core/models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  
  // Use API Gateway URL from environment
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Log the API URL being used for debugging
    if (this.isBrowser) {
      console.log('[AuthService] Using API URL:', this.API_URL);
    }
  }

  /**
   * Register a new user
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, data)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('[AuthService] Login request for:', credentials.username);
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          console.log('[AuthService] Login response received:', {
            hasToken: !!response.access_token,
            tokenLength: response.access_token?.length,
            username: response.user?.username
          });
          this.handleAuthResponse(response);
          console.log('[AuthService] Token saved. isAuthenticated:', this.isAuthenticated());
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    
    return this.http.post(`${this.API_URL}/auth/logout`, { refresh_token: refreshToken })
      .pipe(
        tap(() => this.clearAuthData()),
        catchError(error => {
          // Clear data even if API call fails
          this.clearAuthData();
          return throwError(() => error);
        })
      );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/auth/refresh`, { refresh_token: refreshToken })
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => {
          this.clearAuthData();
          return throwError(() => error);
        })
      );
  }

  /**
   * Get current user from API
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/me`)
      .pipe(
        tap(user => {
          if (this.isBrowser) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          }
          this.currentUserSubject.next(user);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.isBrowser ? localStorage.getItem(this.TOKEN_KEY) : null;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.isBrowser ? localStorage.getItem(this.REFRESH_TOKEN_KEY) : null;
  }

  /**
   * Get current user value
   */
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Handle authentication response
   */
  private handleAuthResponse(response: AuthResponse): void {
    console.log('[AuthService] Handling auth response...');
    if (this.isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, response.access_token);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh_token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
      console.log('[AuthService] Tokens saved to localStorage');
      console.log('[AuthService] Verification - Token exists:', !!localStorage.getItem(this.TOKEN_KEY));
    } else {
      console.warn('[AuthService] Not browser - tokens not saved');
    }
    this.currentUserSubject.next(response.user);
  }

  /**
   * Get user role
   */
  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    if (user && user.roles && user.roles.length > 0) {
      return user.roles[0]; // Return first role
    }
    return null;
  }

  /**
   * Check if user has role
   */
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles?.includes(role) || false;
  }

  /**
   * Redirect based on user role
   */
  redirectByRole(): void {
    const role = this.getUserRole();
    console.log('[AuthService] Redirecting by role:', role);
    
    if (role === 'seller' || this.hasRole('seller')) {
      this.router.navigate(['/seller/dashboard']);
    } else if (role === 'admin' || this.hasRole('admin')) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      // Default to customer products page
      this.router.navigate(['/products']);
    }
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Get user from storage
   */
  private getUserFromStorage(): User | null {
    if (!this.isBrowser) return null;
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || 'Server error occurred';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
