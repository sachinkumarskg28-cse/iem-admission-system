import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard-stats`);
  }

  getStudents(search?: string): Observable<any> {
    const url = search ? `${this.apiUrl}/students?search=${encodeURIComponent(search)}` : `${this.apiUrl}/students`;
    return this.http.get(url);
  }

  toggleUserStatus(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/students/${userId}/toggle-status`, {});
  }

  getOfficers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/officers`);
  }

  createOfficer(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/officers`, data);
  }

  getAdmissionCycles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admission-cycles`);
  }

  saveAdmissionCycle(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admission-cycles`, data);
  }

  getAuditLogs(module?: string): Observable<any> {
    const url = module ? `${this.apiUrl}/audit-logs?module=${module}` : `${this.apiUrl}/audit-logs`;
    return this.http.get(url);
  }

  getDatabaseCollections(): Observable<any> {
    return this.http.get(`${this.apiUrl}/database/collections`);
  }

  getDatabaseRecords(collection: string, search?: string): Observable<any> {
    const url = search ? `${this.apiUrl}/database/${collection}?search=${encodeURIComponent(search)}` : `${this.apiUrl}/database/${collection}`;
    return this.http.get(url);
  }

  createDatabaseRecord(collection: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/database/${collection}`, data);
  }

  updateDatabaseRecord(collection: string, id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/database/${collection}/${id}`, data);
  }

  deleteDatabaseRecord(collection: string, id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/database/${collection}/${id}`);
  }

  getAccountsSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/accounts-summary`);
  }
}
