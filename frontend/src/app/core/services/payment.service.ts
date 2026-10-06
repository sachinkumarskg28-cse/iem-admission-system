import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  initializePayment(applicationId: string, paymentMethod: string = 'UPI'): Observable<any> {
    return this.http.post(`${this.apiUrl}/initialize`, { applicationId, paymentMethod });
  }

  confirmPayment(transactionId: string, simulateStatus: string = 'SUCCESS'): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirm`, { transactionId, simulateStatus });
  }

  getReceipt(receiptNumber: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/receipt/${receiptNumber}`);
  }

  createRazorpayOrder(applicationId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/razorpay/create-order`, { applicationId });
  }

  verifyRazorpayPayment(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/razorpay/verify`, payload);
  }

  getPaymentHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/history`);
  }
}
