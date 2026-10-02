import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OfficerService {
  private apiUrl = `${environment.apiUrl}/officer`;

  constructor(private http: HttpClient) {}

  getApplications(paramsObj: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(paramsObj).forEach((k) => {
      if (paramsObj[k] !== undefined && paramsObj[k] !== null && paramsObj[k] !== '') {
        params = params.set(k, paramsObj[k]);
      }
    });

    return this.http.get(`${this.apiUrl}/applications`, { params });
  }

  verifyDocument(documentId: string, status: 'VERIFIED' | 'REJECTED', remarks: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/documents/${documentId}/verify`, { status, remarks });
  }

  updateApplicationStatus(
    applicationId: string,
    status: string,
    remarks?: string,
    rejectionReason?: string
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/applications/${applicationId}/status`, {
      status,
      remarks,
      rejectionReason,
    });
  }

  getApplicantReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports`);
  }
}
