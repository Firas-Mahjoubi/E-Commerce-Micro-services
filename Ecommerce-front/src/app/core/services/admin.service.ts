import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  keycloak_id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  roles: string[];
  emailVerified: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  roles: string[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  enabled?: boolean;
}

export interface AssignRoleRequest {
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Get all users (admin only)
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<UsersResponse>(this.apiUrl).pipe(
      map(response => {
        // Backend returns { users: [...], pagination: {...} }
        // We need to extract the users array
        if (response && response.users) {
          return response.users;
        }
        // If response is already an array, return as is
        if (Array.isArray(response)) {
          return response;
        }
        // Otherwise return empty array
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get user by ID (admin only)
   */
  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create new user (admin only)
   */
  createUser(userData: CreateUserRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, userData);
  }

  /**
   * Update user (admin only)
   */
  updateUser(userId: string, userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, userData);
  }

  /**
   * Delete user (admin only)
   */
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

  /**
   * Assign role to user (admin only)
   */
  assignRole(userId: string, role: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/roles`, { role });
  }

  /**
   * Remove role from user (admin only)
   */
  removeRole(userId: string, role: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/roles/${role}`);
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: string): Observable<User[]> {
    return new Observable(observer => {
      this.getAllUsers().subscribe({
        next: (users) => {
          const filteredUsers = users.filter(user => user.roles?.includes(role));
          observer.next(filteredUsers);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  /**
   * Get all customers
   */
  getCustomers(): Observable<User[]> {
    return this.getUsersByRole('customer');
  }

  /**
   * Get all sellers
   */
  getSellers(): Observable<User[]> {
    return this.getUsersByRole('seller');
  }

  /**
   * Get all admins
   */
  getAdmins(): Observable<User[]> {
    return this.getUsersByRole('admin');
  }

  /**
   * Search users
   */
  searchUsers(query: string): Observable<User[]> {
    return new Observable(observer => {
      this.getAllUsers().subscribe({
        next: (users) => {
          const searchTerm = query.toLowerCase();
          const filteredUsers = users.filter(user => 
            user.username?.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm) ||
            user.firstName?.toLowerCase().includes(searchTerm) ||
            user.lastName?.toLowerCase().includes(searchTerm)
          );
          observer.next(filteredUsers);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }
  
  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.status === 401) {
      errorMessage = 'Unauthorized: Please login again or contact administrator for admin access';
    } else if (error.status === 403) {
      errorMessage = 'Forbidden: You do not have admin privileges to access this resource';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('Admin Service Error:', {
      status: error.status,
      message: errorMessage,
      error: error.error
    });
    
    return throwError(() => new Error(errorMessage));
  }
}
