import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../core/services/course.service';
import { AuthService } from '../../core/services/auth.service';
import { Course } from '../../core/models/course.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  courseService = inject(CourseService);
  authService = inject(AuthService);
  router = inject(Router);

  courses: Course[] = [];
  selectedDepartment: string = '';
  searchQuery: string = '';
  trackNumber: string = '';
  isLoading = true;

  departments: string[] = [
    'Department of Computer Science & Engineering',
    'Department of Information Technology',
    'Department of Electronics & Communication',
    'Department of Computer Applications',
    'School of Management',
  ];

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.courseService
      .getCourses({
        department: this.selectedDepartment || undefined,
        search: this.searchQuery || undefined,
      })
      .subscribe({
        next: (res) => {
          this.courses = res.courses || [];
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  filterByDepartment(dept: string): void {
    this.selectedDepartment = this.selectedDepartment === dept ? '' : dept;
    this.loadCourses();
  }

  trackApplication(): void {
    if (this.trackNumber.trim()) {
      this.router.navigate(['/track'], {
        queryParams: { appNo: this.trackNumber.trim().toUpperCase() },
      });
    }
  }

  applyForCourse(course: Course): void {
    if (this.authService.isAuthenticated()) {
      if (this.authService.isStudent()) {
        this.router.navigate(['/student/apply'], { queryParams: { courseId: course._id } });
      } else {
        alert('Please log in with a Student account to submit admission applications.');
      }
    } else {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: `/student/apply?courseId=${course._id}` } });
    }
  }
}
