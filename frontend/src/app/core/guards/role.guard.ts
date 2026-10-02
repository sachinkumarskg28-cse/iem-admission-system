import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as Array<string>;
  const currentUser = authService.currentUserValue;

  if (currentUser && expectedRoles.includes(currentUser.role)) {
    return true;
  }

  // If unauthorized, redirect to appropriate home
  if (currentUser?.role === 'student') router.navigate(['/student/dashboard']);
  else if (currentUser?.role === 'officer') router.navigate(['/officer/dashboard']);
  else if (currentUser?.role === 'admin') router.navigate(['/admin/dashboard']);
  else router.navigate(['/auth/login']);

  return false;
};
