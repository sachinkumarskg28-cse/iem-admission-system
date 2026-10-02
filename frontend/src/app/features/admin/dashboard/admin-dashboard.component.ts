import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  adminService = inject(AdminService);

  stats: any = null;
  courseStats: any[] = [];
  monthlyTrends: any[] = [];
  recentActivity: any[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res.stats;
        this.courseStats = res.courseStats || [];
        this.monthlyTrends = res.monthlyTrends || [];
        this.recentActivity = res.recentActivity || [];
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  getMaxMonthlyTotal(): number {
    if (!this.monthlyTrends.length) return 100;
    return Math.max(...this.monthlyTrends.map((m) => m.total || 0), 10);
  }
}
