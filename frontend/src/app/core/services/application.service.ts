import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Application } from '../models/application.model';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private apiUrl = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  saveDraft(data: { applicationId?: string; courseId?: string; currentStep?: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/draft`, data);
  }

  submitApplication(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/submit`, {});
  }

  getMyApplications(): Observable<{ success: boolean; count: number; applications: Application[] }> {
    return this.http.get<{ success: boolean; count: number; applications: Application[] }>(`${this.apiUrl}/my`);
  }

  getApplicationById(id: string): Observable<{ success: boolean; application: Application; documents: any[] }> {
    return this.http.get<{ success: boolean; application: Application; documents: any[] }>(`${this.apiUrl}/${id}`);
  }

  downloadPDF(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download-pdf`, { responseType: 'blob' });
  }

  trackApplication(applicationNumber: string): Observable<{ success: boolean; application: any }> {
    return this.http.get<{ success: boolean; application: any }>(`${this.apiUrl}/track/${applicationNumber}`);
  }
}
