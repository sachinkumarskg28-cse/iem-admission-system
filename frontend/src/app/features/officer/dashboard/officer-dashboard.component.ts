import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfficerService } from '../../../core/services/officer.service';
import { CourseService } from '../../../core/services/course.service';
import { ApplicationService } from '../../../core/services/application.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  templateUrl: './officer-dashboard.component.html',
  styleUrls: ['./officer-dashboard.component.scss'],
})
export class OfficerDashboardComponent implements OnInit {
  officerService = inject(OfficerService);
  courseService = inject(CourseService);
  applicationService = inject(ApplicationService);

  applications: any[] = [];
  courses: any[] = [];
  totalCount = 0;
  isLoading = true;

  // Filter params
  searchQuery = '';
  statusFilter = '';
  courseFilter = '';

  // Modal State
  selectedApp: any = null;
  appDocuments: any[] = [];
  isModalOpen = false;
  officerRemarks = '';
  rejectionReason = '';
  isUpdating = false;

  ngOnInit(): void {
    this.loadCourses();
    this.loadApplications();
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (res) => (this.courses = res.courses || []),
    });
  }

  loadApplications(): void {
    this.isLoading = true;
    this.officerService
      .getApplications({
        search: this.searchQuery,
        status: this.statusFilter,
        courseId: this.courseFilter,
      })
      .subscribe({
        next: (res) => {
          this.applications = res.applications || [];
          this.totalCount = res.total || 0;
          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
      });
  }

  onFilterChange(): void {
    this.loadApplications();
  }

  openReviewModal(app: any): void {
    this.selectedApp = app;
    this.officerRemarks = app.officerRemarks || '';
    this.rejectionReason = app.rejectionReason || '';
    this.isModalOpen = true;

    this.applicationService.getApplicationById(app._id).subscribe({
      next: (res) => {
        this.selectedApp = res.application;
        this.appDocuments = res.documents || [];
      },
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedApp = null;
  }

  verifyDoc(docId: string, status: 'VERIFIED' | 'REJECTED'): void {
    const remark = prompt(`Enter verification remark for this document (${status}):`);
    if (remark === null) return;

    this.officerService.verifyDocument(docId, status, remark).subscribe({
      next: (res) => {
        const doc = this.appDocuments.find((d) => d._id === docId);
        if (doc) {
          doc.status = status;
          doc.verificationRemarks = remark;
        }
      },
      error: (err) => alert(err.error?.message || 'Verification failed.'),
    });
  }

  changeAppStatus(newStatus: string): void {
    if (!this.selectedApp) return;

    if (newStatus === 'REJECTED' && !this.rejectionReason.trim()) {
      alert('Please specify a rejection reason.');
      return;
    }

    this.isUpdating = true;
    this.officerService
      .updateApplicationStatus(
        this.selectedApp._id,
        newStatus,
        this.officerRemarks,
        this.rejectionReason
      )
      .subscribe({
        next: (res) => {
          this.isUpdating = false;
          alert(`Application status updated to ${newStatus}.`);
          this.closeModal();
          this.loadApplications();
        },
        error: (err) => {
          this.isUpdating = false;
          alert(err.error?.message || 'Status update failed.');
        },
      });
  }
}
