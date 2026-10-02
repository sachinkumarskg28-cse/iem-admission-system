import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Password Recovery</h2>
          <p>Enter your registered email address to receive reset instructions</p>
        </div>

        <div *ngIf="successMessage" class="alert alert-success">
          <span class="material-icons">check_circle</span> {{ successMessage }}
        </div>

        <div *ngIf="errorMessage" class="alert alert-danger">
          <span class="material-icons">error</span> {{ errorMessage }}
        </div>

        <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" *ngIf="!successMessage">
          <div class="form-group">
            <label for="email">Registered Email Address</label>
            <input id="email" type="email" formControlName="email" placeholder="name@example.com" />
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="forgotForm.invalid || isLoading">
            <span *ngIf="!isLoading">Send Reset Instructions</span>
            <span *ngIf="isLoading">Sending Email...</span>
          </button>
        </form>

        <div class="auth-footer">
          <p><a routerLink="/auth/login">&larr; Back to Login</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-page { min-height: calc(100vh - 140px); display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
      .auth-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 40px; width: 100%; max-width: 440px; box-shadow: var(--shadow-lg); }
      .auth-header { text-align: center; margin-bottom: 24px; h2 { font-size: 1.5rem; margin-bottom: 4px; } p { font-size: 0.85rem; color: var(--text-muted); } }
      .alert { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: var(--radius-sm); font-size: 0.85rem; margin-bottom: 20px; }
      .alert-success { background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: var(--success); }
      .alert-danger { background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: var(--danger); }
      .btn-block { width: 100%; }
      .auth-footer { margin-top: 24px; text-align: center; font-size: 0.875rem; a { color: var(--iem-primary); font-weight: 600; text-decoration: none; } }
    `,
  ],
})
export class ForgotPasswordComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  onSubmit(): void {
    if (this.forgotForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Password reset instructions sent to your email!';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Email not found.';
      },
    });
  }
}
