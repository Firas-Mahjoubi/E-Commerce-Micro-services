import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CreateOrderRequest, OrderResponse } from '@core/models/order.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/orders`;

  /**
   * Create a new order
   */
  createOrder(orderRequest: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.apiUrl, orderRequest)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get all orders for the current customer
   */
  getMyOrders(): Observable<OrderResponse[]> {
    const user = this.authService.getCurrentUserValue();
    if (!user || !user.sub && !user.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    const customerId = user.sub || user.id;
    return this.http.get<OrderResponse[]>(`${this.apiUrl}/customer/${customerId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get a specific order by ID
   */
  getOrderById(orderId: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/${orderId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get a specific order for the current customer
   */
  getOrderByIdAndCustomer(orderId: number): Observable<OrderResponse> {
    const user = this.authService.getCurrentUserValue();
    if (!user || !user.sub && !user.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    const customerId = user.sub || user.id;
    return this.http.get<OrderResponse>(
      `${this.apiUrl}/${orderId}/customer/${customerId}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: number, status: string): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(
      `${this.apiUrl}/${orderId}/status?status=${status}`,
      null
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Cancel an order
   */
  cancelOrder(orderId: number): Observable<OrderResponse> {
    const user = this.authService.getCurrentUserValue();
    if (!user || !user.sub && !user.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    const customerId = user.sub || user.id;
    return this.http.put<OrderResponse>(
      `${this.apiUrl}/${orderId}/cancel/customer/${customerId}`,
      null
    ).pipe(
      catchError(this.handleError)
    );
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
