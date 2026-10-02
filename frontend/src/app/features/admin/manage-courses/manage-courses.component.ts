import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';

@Component({
  selector: 'app-manage-courses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-courses-page container">
      <div class="page-header card">
        <div>
          <h2>Degree Programs & Seat Capacity Matrix</h2>
          <p>Create new degree offerings, update tuition fee slabs, and calibrate seat capacity.</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <span class="material-icons">add_circle</span> Add New Course
        </button>
      </div>

      <!-- Courses List Table -->
      <div class="table-card card" *ngIf="!isLoading">
        <table class="data-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Program Name</th>
              <th>Department</th>
              <th>Total Seats</th>
              <th>Available Seats</th>
              <th>Total Fee (₹)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let course of courses">
              <td><strong>{{ course.courseCode }}</strong></td>
              <td>{{ course.name }}</td>
              <td>{{ course.department }}</td>
              <td>{{ course.totalSeats }}</td>
              <td><span class="seat-pill">{{ course.availableSeats }}</span></td>
              <td>₹ {{ course.feesStructure?.totalCourseFee | number }}</td>
              <td>
                <span class="badge" [class.badge-approved]="course.isActive" [class.badge-rejected]="!course.isActive">
                  {{ course.isActive ? 'ACTIVE' : 'INACTIVE' }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="btn btn-outline btn-sm" (click)="editCourse(course)">Edit</button>
                  <button class="btn btn-danger btn-sm" (click)="deleteCourse(course._id)">Deactivate</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create / Edit Course Modal -->
      <div class="modal-backdrop" *ngIf="isModalOpen">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ isEditMode ? 'Edit Course' : 'Create New Degree Program' }}</h3>
            <button class="close-btn" (click)="closeModal()">&times;</button>
          </div>
          <form [formGroup]="courseForm" (ngSubmit)="saveCourse()">
            <div class="modal-body">
              <div class="form-grid">
                <div class="form-group">
                  <label>Course Code *</label>
                  <input type="text" formControlName="courseCode" placeholder="e.g. BTECH-CSE" />
                </div>
                <div class="form-group">
                  <label>Program Name *</label>
                  <input type="text" formControlName="name" placeholder="e.g. B.Tech in CSE" />
                </div>
                <div class="form-group">
                  <label>Department *</label>
                  <select formControlName="department">
                    <option value="School of Engineering & Technology">School of Engineering & Technology</option>
                    <option value="Department of Computer Science & Engineering">Department of Computer Science & Engineering</option>
                    <option value="Department of Information Technology">Department of Information Technology</option>
                    <option value="Department of Electronics & Communication">Department of Electronics & Communication</option>
                    <option value="Department of Computer Applications">Department of Computer Applications</option>
                    <option value="School of Management">School of Management</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Level</label>
                  <select formControlName="level">
                    <option value="UG">UG (Undergraduate)</option>
                    <option value="PG">PG (Postgraduate)</option>
                    <option value="Diploma">Diploma</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Total Seats *</label>
                  <input type="number" formControlName="totalSeats" />
                </div>
                <div class="form-group">
                  <label>Available Seats *</label>
                  <input type="number" formControlName="availableSeats" />
                </div>
              </div>

              <div class="form-group">
                <label>Eligibility Criteria *</label>
                <textarea formControlName="eligibilityCriteria" rows="2"></textarea>
              </div>

              <div formGroupName="feesStructure" class="fee-form-box">
                <h4>Tuition & Fee Structure (₹)</h4>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Admission Fee</label>
                    <input type="number" formControlName="admissionFee" />
                  </div>
                  <div class="form-group">
                    <label>Per Semester Tuition</label>
                    <input type="number" formControlName="perSemesterTuition" />
                  </div>
                  <div class="form-group">
                    <label>Total Semesters</label>
                    <input type="number" formControlName="totalSemesters" />
                  </div>
                  <div class="form-group">
                    <label>Caution Deposit</label>
                    <input type="number" formControlName="cautionDeposit" />
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="courseForm.invalid">Save Course</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-courses-page { padding: 40px 20px; }
      .page-header { display: flex; justify-content: space-between; align-items: center; padding: 24px; margin-bottom: 24px; h2 { font-size: 1.6rem; margin-bottom: 4px; } p { font-size: 0.85rem; color: var(--text-muted); } }
      .table-card { padding: 0; overflow: hidden; }
      .seat-pill { background: rgba(16, 185, 129, 0.15); color: #10b981; font-weight: 700; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; }
      .action-btns { display: flex; gap: 8px; }
      .modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
      .modal-card { background: var(--bg-card); border-radius: var(--radius-md); width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
      .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color); .close-btn { background: none; border: none; font-size: 1.4rem; cursor: pointer; color: var(--text-muted); } }
      .modal-body { padding: 24px; }
      .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .fee-form-box { background: var(--bg-subtle); padding: 16px; border-radius: var(--radius-sm); margin-top: 16px; h4 { font-size: 0.95rem; margin-bottom: 12px; } }
      .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border-color); background: var(--bg-subtle); }
    `,
  ],
})
export class ManageCoursesComponent implements OnInit {
  fb = inject(FormBuilder);
  courseService = inject(CourseService);

  courses: Course[] = [];
  isLoading = true;
  isModalOpen = false;
  isEditMode = false;
  selectedCourseId: string | null = null;
  courseForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadCourses();
  }

  initForm(): void {
    this.courseForm = this.fb.group({
      courseCode: ['', Validators.required],
      name: ['', Validators.required],
      department: ['School of Engineering & Technology', Validators.required],
      level: ['UG'],
      totalSeats: [120, [Validators.required, Validators.min(1)]],
      availableSeats: [120, [Validators.required, Validators.min(0)]],
      eligibilityCriteria: ['10+2 with minimum 60% PCM', Validators.required],
      feesStructure: this.fb.group({
        admissionFee: [30000],
        perSemesterTuition: [85000],
        totalSemesters: [8],
        cautionDeposit: [10000],
      }),
    });
  }

  loadCourses(): void {
    this.isLoading = true;
    this.courseService.getCourses().subscribe({
      next: (res) => {
        this.courses = res.courses || [];
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedCourseId = null;
    this.courseForm.reset({
      department: 'School of Engineering & Technology',
      level: 'UG',
      totalSeats: 120,
      availableSeats: 120,
      eligibilityCriteria: '10+2 with minimum 60% PCM',
      feesStructure: { admissionFee: 30000, perSemesterTuition: 85000, totalSemesters: 8, cautionDeposit: 10000 },
    });
    this.isModalOpen = true;
  }

  editCourse(c: Course): void {
    this.isEditMode = true;
    this.selectedCourseId = c._id;
    this.courseForm.patchValue(c);
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveCourse(): void {
    if (this.courseForm.invalid) return;

    if (this.isEditMode && this.selectedCourseId) {
      this.courseService.updateCourse(this.selectedCourseId, this.courseForm.value).subscribe({
        next: () => {
          this.closeModal();
          this.loadCourses();
        },
        error: (err) => alert(err.error?.message || 'Update failed.'),
      });
    } else {
      this.courseService.createCourse(this.courseForm.value).subscribe({
        next: () => {
          this.closeModal();
          this.loadCourses();
        },
        error: (err) => alert(err.error?.message || 'Creation failed.'),
      });
    }
  }

  deleteCourse(id: string): void {
    if (!confirm('Deactivate this course?')) return;
    this.courseService.deleteCourse(id).subscribe({
      next: () => this.loadCourses(),
      error: (err) => alert(err.error?.message || 'Could not deactivate.'),
    });
  }
}
