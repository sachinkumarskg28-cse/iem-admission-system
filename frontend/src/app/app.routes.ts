import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { TrackApplicationComponent } from './features/track/track-application.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { StudentDashboardComponent } from './features/student/dashboard/student-dashboard.component';
import { StudentProfileComponent } from './features/student/profile/student-profile.component';
import { ApplyWizardComponent } from './features/student/apply/apply-wizard.component';
import { ApplicationDetailComponent } from './features/student/application-detail/application-detail.component';
import { StudentDocumentsComponent } from './features/student/documents/student-documents.component';
import { OfficerDashboardComponent } from './features/officer/dashboard/officer-dashboard.component';
import { OfficerReportsComponent } from './features/officer/reports/officer-reports.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { ManageCoursesComponent } from './features/admin/manage-courses/manage-courses.component';
import { ManageStudentsComponent } from './features/admin/manage-students/manage-students.component';
import { ManageOfficersComponent } from './features/admin/manage-officers/manage-officers.component';
import { AuditLogsComponent } from './features/admin/audit-logs/audit-logs.component';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public
  { path: '', component: HomeComponent },
  { path: 'track', component: TrackApplicationComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },

  // Student Protected Routes
  {
    path: 'student/dashboard',
    component: StudentDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['student'] },
  },
  {
    path: 'student/profile',
    component: StudentProfileComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['student'] },
  },
  {
    path: 'student/apply',
    component: ApplyWizardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['student'] },
  },
  {
    path: 'student/applications/:id',
    component: ApplicationDetailComponent,
    canActivate: [authGuard],
  },
  {
    path: 'student/documents',
    component: StudentDocumentsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['student'] },
  },

  // Officer Protected Routes
  {
    path: 'officer/dashboard',
    component: OfficerDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['officer', 'admin'] },
  },
  {
    path: 'officer/reports',
    component: OfficerReportsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['officer', 'admin'] },
  },

  // Admin Protected Routes
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/courses',
    component: ManageCoursesComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/students',
    component: ManageStudentsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/officers',
    component: ManageOfficersComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/audit-logs',
    component: AuditLogsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },

  // Fallback
  { path: '**', redirectTo: '' },
];
