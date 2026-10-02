import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StudentProfile } from '../models/student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/student`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<{ success: boolean; student: StudentProfile }> {
    return this.http.get<{ success: boolean; student: StudentProfile }>(`${this.apiUrl}/profile`);
  }

  updateProfile(profileData: any): Observable<{ success: boolean; message: string; student: StudentProfile }> {
    return this.http.put<{ success: boolean; message: string; student: StudentProfile }>(
      `${this.apiUrl}/profile`,
      profileData
    );
  }

  getDashboardSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard-overview`);
  }
}
