import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CreateOrderRequest, OrderResponse } from '@core/models/order.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:8100/api/orders';

  /**
   * Create a new order
   */
  createOrder(orderRequest: CreateOrderRequest): Observable<OrderResponse> {
    const headers = this.getHeaders();
    return this.http.post<OrderResponse>(this.apiUrl, orderRequest, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get all orders for the current customer
   */
  getMyOrders(): Observable<OrderResponse[]> {
    const user = this.authService.getCurrentUserValue();
    if (!user || !user.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    const headers = this.getHeaders();
    return this.http.get<OrderResponse[]>(`${this.apiUrl}/customer/${user.id}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get a specific order by ID
   */
  getOrderById(orderId: number): Observable<OrderResponse> {
    const headers = this.getHeaders();
    return this.http.get<OrderResponse>(`${this.apiUrl}/${orderId}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get a specific order for the current customer
   */
  getOrderByIdAndCustomer(orderId: number): Observable<OrderResponse> {
    const user = this.authService.getCurrentUserValue();
    if (!user || !user.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    const headers = this.getHeaders();
    return this.http.get<OrderResponse>(
      `${this.apiUrl}/${orderId}/customer/${user.id}`,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: number, status: string): Observable<OrderResponse> {
    const headers = this.getHeaders();
    return this.http.put<OrderResponse>(
      `${this.apiUrl}/${orderId}/status?status=${status}`,
      null,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Cancel an order
   */
  cancelOrder(orderId: number): Observable<OrderResponse> {
    const user = this.authService.getCurrentUserValue();
    if (!user || !user.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    const headers = this.getHeaders();
    return this.http.put<OrderResponse>(
      `${this.apiUrl}/${orderId}/cancel/customer/${user.id}`,
      null,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get authorization headers with JWT token
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('Order service error:', error);
    let errorMessage = 'An error occurred while processing your order';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'You must be logged in to perform this action';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to perform this action';
      } else if (error.status === 404) {
        errorMessage = 'Order not found';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
