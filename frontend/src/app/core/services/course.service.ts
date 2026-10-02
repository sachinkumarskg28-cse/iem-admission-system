import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Course } from '../models/course.model';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) {}

  getCourses(filters: { department?: string; level?: string; search?: string } = {}): Observable<{ success: boolean; count: number; courses: Course[] }> {
    let params = new HttpParams();
    if (filters.department) params = params.set('department', filters.department);
    if (filters.level) params = params.set('level', filters.level);
    if (filters.search) params = params.set('search', filters.search);

    return this.http.get<{ success: boolean; count: number; courses: Course[] }>(this.apiUrl, { params });
  }

  getCourseById(id: string): Observable<{ success: boolean; course: Course }> {
    return this.http.get<{ success: boolean; course: Course }>(`${this.apiUrl}/${id}`);
  }

  createCourse(course: Partial<Course>): Observable<any> {
    return this.http.post(this.apiUrl, course);
  }

  updateCourse(id: string, course: Partial<Course>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, course);
  }

  deleteCourse(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
