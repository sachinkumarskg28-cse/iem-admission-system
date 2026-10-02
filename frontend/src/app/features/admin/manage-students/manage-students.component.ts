import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-manage-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-students-page container">
      <div class="page-header card">
        <div>
          <h2>Student Directory & Records</h2>
          <p>Search, inspect academic scores, and manage account statuses of registered applicants.</p>
        </div>
      </div>

      <div class="search-bar card">
        <div class="search-input">
          <span class="material-icons">search</span>
          <input type="text" [(ngModel)]="search" (input)="onSearch()" placeholder="Search students by name, email, or contact..." />
        </div>
      </div>

      <div class="table-card card" *ngIf="!isLoading">
        <table class="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Category</th>
              <th>Profile %</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of students">
              <td><strong>{{ s.profile?.studentId || 'N/A' }}</strong></td>
              <td>{{ s.user.name }}</td>
              <td>{{ s.user.email }}</td>
              <td>{{ s.user.phone || 'N/A' }}</td>
              <td>{{ s.profile?.category || 'General' }}</td>
              <td>
                <span class="badge badge-submitted">{{ s.profile?.completionPercentage || 20 }}%</span>
              </td>
              <td>
                <span class="badge" [class.badge-approved]="s.user.isActive" [class.badge-rejected]="!s.user.isActive">
                  {{ s.user.isActive ? 'ACTIVE' : 'INACTIVE' }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm" [class.btn-danger]="s.user.isActive" [class.btn-success]="!s.user.isActive" (click)="toggleStatus(s.user._id)">
                  {{ s.user.isActive ? 'Deactivate' : 'Activate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-students-page { padding: 40px 20px; }
      .page-header { padding: 24px; margin-bottom: 24px; h2 { font-size: 1.6rem; margin-bottom: 4px; } p { font-size: 0.85rem; color: var(--text-muted); } }
      .search-bar { padding: 12px 20px; margin-bottom: 24px; .search-input { display: flex; align-items: center; gap: 10px; .material-icons { color: var(--text-muted); } input { width: 100%; border: none; outline: none; background: transparent; font-size: 1rem; color: var(--text-main); } } }
      .table-card { padding: 0; overflow: hidden; }
    `,
  ],
})
export class ManageStudentsComponent implements OnInit {
  adminService = inject(AdminService);
  students: any[] = [];
  search = '';
  isLoading = true;

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.adminService.getStudents(this.search).subscribe({
      next: (res) => {
        this.students = res.students || [];
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  onSearch(): void {
    this.loadStudents();
  }

  toggleStatus(userId: string): void {
    this.adminService.toggleUserStatus(userId).subscribe({
      next: () => this.loadStudents(),
    });
  }
}
