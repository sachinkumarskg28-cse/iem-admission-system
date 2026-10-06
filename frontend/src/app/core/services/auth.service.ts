import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient, private router: Router) {
    const savedUser = localStorage.getItem('iem_user');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      savedUser ? JSON.parse(savedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem('iem_token');
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.success && res.token) {
          localStorage.setItem('iem_token', res.token);
          localStorage.setItem('iem_user', JSON.stringify(res.user));
          if (res.student) {
            localStorage.setItem('iem_student', JSON.stringify(res.student));
          }
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((res) => {
        if (res.success && res.token) {
          localStorage.setItem('iem_token', res.token);
          localStorage.setItem('iem_user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('iem_token');
    localStorage.removeItem('iem_user');
    localStorage.removeItem('iem_student');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.currentUserValue;
  }

  isStudent(): boolean {
    return this.currentUserValue?.role === 'student';
  }

  isOfficer(): boolean {
    return this.currentUserValue?.role === 'officer' || this.currentUserValue?.role === 'admission_officer';
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin' || this.currentUserValue?.role === 'super_admin';
  }

  isFaculty(): boolean {
    return this.currentUserValue?.role === 'faculty';
  }

  isAccounts(): boolean {
    return this.currentUserValue?.role === 'accounts';
  }

  isSuperAdmin(): boolean {
    return this.currentUserValue?.role === 'super_admin';
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password/${token}`, data);
  }
}
