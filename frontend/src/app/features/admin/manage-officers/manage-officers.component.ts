import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-manage-officers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-officers-page container">
      <div class="page-header card">
        <div>
          <h2>Admission Scrutiny Officers</h2>
          <p>Manage staff credentials and assign departmental scrutiny desks.</p>
        </div>
        <button class="btn btn-primary" (click)="isModalOpen = true">
          <span class="material-icons">person_add</span> Create New Officer
        </button>
      </div>

      <!-- Officers Table -->
      <div class="table-card card" *ngIf="!isLoading">
        <table class="data-table">
          <thead>
            <tr>
              <th>Officer Name</th>
              <th>Email</th>
              <th>Department / School</th>
              <th>Contact</th>
              <th>Account Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let off of officers">
              <td><strong>{{ off.name }}</strong></td>
              <td>{{ off.email }}</td>
              <td>{{ off.department || 'School of Engineering' }}</td>
              <td>{{ off.phone || 'N/A' }}</td>
              <td>
                <span class="badge" [class.badge-approved]="off.isActive" [class.badge-rejected]="!off.isActive">
                  {{ off.isActive ? 'ACTIVE' : 'INACTIVE' }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm" [class.btn-danger]="off.isActive" [class.btn-success]="!off.isActive" (click)="toggleStatus(off._id)">
                  {{ off.isActive ? 'Deactivate' : 'Activate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create Officer Modal -->
      <div class="modal-backdrop" *ngIf="isModalOpen">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Add Admission Officer</h3>
            <button class="close-btn" (click)="isModalOpen = false">&times;</button>
          </div>
          <form [formGroup]="officerForm" (ngSubmit)="saveOfficer()">
            <div class="modal-body">
              <div class="form-group">
                <label>Full Name *</label>
                <input type="text" formControlName="name" placeholder="e.g. Dr. Arindam Mukherjee" />
              </div>
              <div class="form-group">
                <label>Official Email *</label>
                <input type="email" formControlName="email" placeholder="officer.dept@iem.edu.in" />
              </div>
              <div class="form-group">
                <label>Initial Password *</label>
                <input type="password" formControlName="password" placeholder="Min 6 characters" />
              </div>
              <div class="form-group">
                <label>Department Assigned *</label>
                <select formControlName="department">
                  <option value="School of Engineering & Technology">School of Engineering & Technology</option>
                  <option value="Department of Computer Science & Engineering">Department of Computer Science & Engineering</option>
                  <option value="Department of Information Technology">Department of Information Technology</option>
                  <option value="School of Management">School of Management</option>
                  <option value="Department of Computer Applications">Department of Computer Applications</option>
                </select>
              </div>
              <div class="form-group">
                <label>Mobile Number</label>
                <input type="tel" formControlName="phone" placeholder="+91 98300..." />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="isModalOpen = false">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="officerForm.invalid">Create Officer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-officers-page { padding: 40px 20px; }
      .page-header { display: flex; justify-content: space-between; align-items: center; padding: 24px; margin-bottom: 24px; h2 { font-size: 1.6rem; margin-bottom: 4px; } p { font-size: 0.85rem; color: var(--text-muted); } }
      .table-card { padding: 0; overflow: hidden; }
      .modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
      .modal-card { background: var(--bg-card); border-radius: var(--radius-md); width: 100%; max-width: 500px; box-shadow: var(--shadow-lg); }
      .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color); .close-btn { background: none; border: none; font-size: 1.4rem; cursor: pointer; color: var(--text-muted); } }
      .modal-body { padding: 24px; }
      .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border-color); background: var(--bg-subtle); }
    `,
  ],
})
export class ManageOfficersComponent implements OnInit {
  fb = inject(FormBuilder);
  adminService = inject(AdminService);

  officers: any[] = [];
  isLoading = true;
  isModalOpen = false;
  officerForm!: FormGroup;

  ngOnInit(): void {
    this.officerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      department: ['School of Engineering & Technology', Validators.required],
      phone: [''],
    });

    this.loadOfficers();
  }

  loadOfficers(): void {
    this.isLoading = true;
    this.adminService.getOfficers().subscribe({
      next: (res) => {
        this.officers = res.officers || [];
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  saveOfficer(): void {
    if (this.officerForm.invalid) return;
    this.adminService.createOfficer(this.officerForm.value).subscribe({
      next: () => {
        this.isModalOpen = false;
        this.officerForm.reset({ department: 'School of Engineering & Technology' });
        this.loadOfficers();
      },
      error: (err) => alert(err.error?.message || 'Creation failed.'),
    });
  }

  toggleStatus(userId: string): void {
    this.adminService.toggleUserStatus(userId).subscribe({
      next: () => this.loadOfficers(),
    });
  }
}
