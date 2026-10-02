import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { StudentService } from '../../../core/services/student.service';
import { ApplicationService } from '../../../core/services/application.service';
import { DocumentService } from '../../../core/services/document.service';
import { PaymentService } from '../../../core/services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Course } from '../../../core/models/course.model';

@Component({
  selector: 'app-apply-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './apply-wizard.component.html',
  styleUrls: ['./apply-wizard.component.scss'],
})
export class ApplyWizardComponent implements OnInit {
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  courseService = inject(CourseService);
  studentService = inject(StudentService);
  applicationService = inject(ApplicationService);
  documentService = inject(DocumentService);
  paymentService = inject(PaymentService);
  authService = inject(AuthService);

  currentStep = 1; // 1 to 6
  courses: Course[] = [];
  selectedCourse: Course | null = null;
  studentProfile: any = null;
  applicationId: string | null = null;
  applicationNumber: string = '';

  uploadedDocs: { [key: string]: any } = {};
  declarationAccepted = false;
  paymentMethod = 'UPI';

  // Payment State
  isProcessingPayment = false;
  paymentSuccess = false;
  paymentReceipt: any = null;

  isLoading = true;
  isSaving = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;

    this.courseService.getCourses({}).subscribe({
      next: (res) => {
        this.courses = res.courses || [];

        this.studentService.getProfile().subscribe({
          next: (sRes) => {
            this.studentProfile = sRes.student;

            // Check if pre-selected course from query param
            const queryCourseId = this.route.snapshot.queryParams['courseId'];
            if (queryCourseId) {
              const matched = this.courses.find((c) => c._id === queryCourseId);
              if (matched) this.selectCourse(matched);
            }

            this.loadMyDocuments();
            this.isLoading = false;
          },
          error: () => (this.isLoading = false),
        });
      },
      error: () => (this.isLoading = false),
    });
  }

  loadMyDocuments(): void {
    this.documentService.getMyDocuments().subscribe({
      next: (res) => {
        (res.documents || []).forEach((doc: any) => {
          this.uploadedDocs[doc.documentType] = doc;
        });
      },
    });
  }

  selectCourse(course: Course): void {
    this.selectedCourse = course;
  }

  goToStep(step: number): void {
    if (step === 2 && !this.selectedCourse) {
      alert('Please select a course to continue.');
      return;
    }

    if (step === 2 && !this.applicationId && this.selectedCourse) {
      // Create draft
      this.isSaving = true;
      this.applicationService
        .saveDraft({ courseId: this.selectedCourse._id, currentStep: step })
        .subscribe({
          next: (res) => {
            this.isSaving = false;
            this.applicationId = res.application._id;
            this.applicationNumber = res.application.applicationNumber;
            this.currentStep = step;
          },
          error: (err) => {
            this.isSaving = false;
            alert(err.error?.message || 'Could not initiate draft.');
          },
        });
      return;
    }

    this.currentStep = step;
  }

  onFileUpload(event: any, documentType: string): void {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (this.applicationId) formData.append('applicationId', this.applicationId);

    this.documentService.uploadDocument(formData).subscribe({
      next: (res) => {
        this.uploadedDocs[documentType] = res.document;
      },
      error: (err) => {
        alert(err.error?.message || 'Upload failed.');
      },
    });
  }

  submitApplication(): void {
    if (!this.applicationId) return;

    this.isSaving = true;
    this.applicationService.submitApplication(this.applicationId).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.currentStep = 6; // Move to payment step
      },
      error: (err) => {
        this.isSaving = false;
        alert(err.error?.message || 'Submission failed.');
      },
    });
  }

  payMockFee(): void {
    if (!this.applicationId) return;

    this.isProcessingPayment = true;
    this.paymentService.initializePayment(this.applicationId, this.paymentMethod).subscribe({
      next: (initRes) => {
        // Confirm mock payment callback
        setTimeout(() => {
          this.paymentService.confirmPayment(initRes.order.transactionId, 'SUCCESS').subscribe({
            next: (confRes) => {
              this.isProcessingPayment = false;
              this.paymentSuccess = true;
              this.paymentReceipt = confRes.payment;
            },
            error: () => {
              this.isProcessingPayment = false;
              alert('Payment processing failed.');
            },
          });
        }, 1500);
      },
      error: () => {
        this.isProcessingPayment = false;
        alert('Could not initialize payment.');
      },
    });
  }

  downloadForm(): void {
    if (!this.applicationId) return;
    this.applicationService.downloadPDF(this.applicationId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `IEM_Admission_${this.applicationNumber || 'Application'}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
    });
  }
}
