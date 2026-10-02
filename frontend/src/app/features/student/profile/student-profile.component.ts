import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StudentService } from '../../../core/services/student.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-profile.component.html',
  styleUrls: ['./student-profile.component.scss'],
})
export class StudentProfileComponent implements OnInit {
  fb = inject(FormBuilder);
  studentService = inject(StudentService);
  authService = inject(AuthService);

  activeTab: 'personal' | 'guardian' | 'address' | 'academics' = 'personal';
  profileForm!: FormGroup;
  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  completionPercentage = 20;

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      // Personal
      name: ['', Validators.required],
      phone: ['', Validators.required],
      dob: [''],
      gender: ['Male'],
      bloodGroup: ['B+'],
      nationality: ['Indian'],
      category: ['General'],
      isPhysicallyChallenged: [false],

      // Guardian
      guardian: this.fb.group({
        fatherName: [''],
        fatherOccupation: [''],
        fatherPhone: [''],
        motherName: [''],
        motherOccupation: [''],
        motherPhone: [''],
        annualIncome: [0],
      }),

      // Address
      address: this.fb.group({
        present: this.fb.group({
          street: [''],
          city: [''],
          district: [''],
          state: ['West Bengal'],
          pincode: [''],
          country: ['India'],
        }),
      }),

      // Academics
      academics: this.fb.group({
        class10: this.fb.group({
          board: ['CBSE'],
          schoolName: [''],
          passingYear: [2022],
          rollNumber: [''],
          percentage: [0],
        }),
        class12: this.fb.group({
          board: ['CBSE'],
          schoolName: [''],
          passingYear: [2024],
          stream: ['Science'],
          percentage: [0],
          pcmPercentage: [0],
        }),
        entranceExam: this.fb.group({
          examType: ['WBJEE'],
          rollNumber: [''],
          rank: [0],
          score: [0],
          examYear: [2026],
        }),
      }),
    });
  }

  loadProfile(): void {
    this.isLoading = true;
    this.studentService.getProfile().subscribe({
      next: (res) => {
        const student = res.student;
        const user = this.authService.currentUserValue;

        this.completionPercentage = student.completionPercentage || 20;

        this.profileForm.patchValue({
          name: (student.user as any)?.name || user?.name || '',
          phone: (student.user as any)?.phone || user?.phone || '',
          dob: student.dob ? new Date(student.dob).toISOString().substring(0, 10) : '',
          gender: student.gender || 'Male',
          bloodGroup: student.bloodGroup || 'B+',
          nationality: student.nationality || 'Indian',
          category: student.category || 'General',
          isPhysicallyChallenged: student.isPhysicallyChallenged || false,
          guardian: student.guardian || {},
          address: student.address || {},
          academics: student.academics || {},
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  setTab(tab: 'personal' | 'guardian' | 'address' | 'academics'): void {
    this.activeTab = tab;
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.studentService.updateProfile(this.profileForm.value).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.successMessage = 'Profile updated successfully!';
        this.completionPercentage = res.student.completionPercentage || 80;
        setTimeout(() => (this.successMessage = ''), 4000);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Failed to update profile.';
      },
    });
  }
}
