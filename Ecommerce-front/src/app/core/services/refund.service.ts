import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import {
  RefundRequest,
  RefundResponse,
  RefundStatus,
  SellerRefundResponse
} from '@core/models/refund.model';

@Injectable({
  providedIn: 'root'
})
export class RefundService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:8085/api';

  // Customer endpoints
  createRefund(refundRequest: RefundRequest): Observable<RefundResponse> {
    return this.http.post<RefundResponse>(
      `${this.apiUrl}/customer/refunds`,
      refundRequest,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  getCustomerRefunds(): Observable<RefundResponse[]> {
    const user = this.authService.getCurrentUserValue();
    if (!user || !user.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<RefundResponse[]>(
      `${this.apiUrl}/customer/refunds`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  getRefundById(refundId: number): Observable<RefundResponse> {
    return this.http.get<RefundResponse>(
      `${this.apiUrl}/customer/refunds/${refundId}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  cancelRefund(refundId: number): Observable<void> {
    const user = this.authService.getCurrentUserValue();
    if (!user || !user.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    // Note: This endpoint might not exist in the backend yet
    // We're keeping it for future implementation
    return this.http.delete<void>(
      `${this.apiUrl}/customer/refunds/${refundId}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  // Seller endpoints
  getSellerRefunds(): Observable<RefundResponse[]> {
    const user = this.authService.getCurrentUserValue();
    if (!user || !user.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<RefundResponse[]>(
      `${this.apiUrl}/seller/refunds`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  getSellerRefundById(refundId: number): Observable<RefundResponse> {
    return this.http.get<RefundResponse>(
      `${this.apiUrl}/seller/refunds/${refundId}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  updateRefundStatus(refundId: number, status: RefundStatus): Observable<RefundResponse> {
    return this.http.put<RefundResponse>(
      `${this.apiUrl}/seller/refunds/${refundId}/status?status=${status}`,
      {},
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  // Helper methods
  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check if the refund service is running.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'Refund not found.';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Invalid refund request.';
      } else {
        errorMessage = error.error?.message || `Server error: ${error.status}`;
      }
    }

    console.error('Refund Service Error:', error);
    return throwError(() => ({ message: errorMessage, status: error.status }));
  }
}
