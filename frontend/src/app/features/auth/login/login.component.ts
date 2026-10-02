import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  returnUrl = '';
  sessionExpired = false;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
    this.sessionExpired = this.route.snapshot.queryParams['sessionExpired'] === 'true';

    // If already logged in, redirect
    if (this.authService.isAuthenticated()) {
      this.redirectByRole();
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.redirectByRole();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password credentials.';
      },
    });
  }

  fillDemo(role: 'student' | 'officer' | 'admin'): void {
    if (role === 'student') {
      this.loginForm.patchValue({
        email: 'student.rahul@gmail.com',
        password: 'Student@123',
      });
    } else if (role === 'officer') {
      this.loginForm.patchValue({
        email: 'officer.engg@iem.edu.in',
        password: 'Officer@123',
      });
    } else if (role === 'admin') {
      this.loginForm.patchValue({
        email: 'admin@iem.edu.in',
        password: 'Admin@123',
      });
    }
  }

  private redirectByRole(): void {
    const user = this.authService.currentUserValue;
    if (user?.role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (user?.role === 'officer') {
      this.router.navigate(['/officer/dashboard']);
    } else {
      this.router.navigate(['/student/dashboard']);
    }
  }
}
