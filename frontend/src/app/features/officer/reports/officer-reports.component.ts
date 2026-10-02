import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficerService } from '../../../core/services/officer.service';

@Component({
  selector: 'app-officer-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reports-page container" *ngIf="!isLoading && reportData">
      <div class="page-header card">
        <div>
          <h2>Admissions Scrutiny & Conversion Reports</h2>
          <p>Generated for {{ reportData.generatedBy }} on {{ reportData.generatedAt | date:'medium' }}</p>
        </div>
      </div>

      <!-- KPI Summary -->
      <div class="kpi-grid">
        <div class="kpi-card card">
          <div class="kpi-val">{{ reportData.summary.totalApplications }}</div>
          <div class="kpi-lbl">Total Applicants</div>
        </div>
        <div class="kpi-card card">
          <div class="kpi-val success">{{ reportData.summary.approvedApplications }}</div>
          <div class="kpi-lbl">Approved & Admitted</div>
        </div>
        <div class="kpi-card card">
          <div class="kpi-val warning">{{ reportData.summary.pendingApplications }}</div>
          <div class="kpi-lbl">Pending Scrutiny</div>
        </div>
        <div class="kpi-card card">
          <div class="kpi-val danger">{{ reportData.summary.rejectedApplications }}</div>
          <div class="kpi-lbl">Rejected</div>
        </div>
      </div>

      <!-- Course Breakdown Table -->
      <div class="table-card card">
        <h3>Program-wise Admission Matrix & Seat Occupancy</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Total Capacity</th>
              <th>Available Seats</th>
              <th>Applicant Count</th>
              <th>Seats Approved</th>
              <th>Occupancy %</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of reportData.courseBreakdown">
              <td><strong>{{ c.courseCode }}</strong></td>
              <td>{{ c.courseName }}</td>
              <td>{{ c.totalSeats }}</td>
              <td>{{ c.availableSeats }}</td>
              <td><strong>{{ c.applicantCount }}</strong></td>
              <td><span class="badge badge-approved">{{ c.approvedCount }}</span></td>
              <td>
                <div class="occupancy-bar-wrapper">
                  <div class="occupancy-bar" [style.width.%]="(c.approvedCount / c.totalSeats) * 100"></div>
                  <span>{{ ((c.approvedCount / c.totalSeats) * 100).toFixed(1) }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      .reports-page { padding: 40px 20px; }
      .page-header { padding: 24px; margin-bottom: 24px; h2 { font-size: 1.6rem; margin-bottom: 4px; } p { font-size: 0.85rem; color: var(--text-muted); } }
      .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 28px; }
      .kpi-card { padding: 20px; text-align: center; .kpi-val { font-size: 2rem; font-weight: 800; margin-bottom: 4px; color: var(--iem-primary); &.success { color: #10b981; } &.warning { color: #f59e0b; } &.danger { color: #ef4444; } } .kpi-lbl { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); } }
      .table-card { padding: 24px; h3 { font-size: 1.2rem; margin-bottom: 16px; } }
      .occupancy-bar-wrapper { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; .occupancy-bar { height: 8px; background: #10b981; border-radius: 4px; min-width: 4px; max-width: 100px; } }
    `,
  ],
})
export class OfficerReportsComponent implements OnInit {
  officerService = inject(OfficerService);
  reportData: any = null;
  isLoading = true;

  ngOnInit(): void {
    this.officerService.getApplicantReport().subscribe({
      next: (res) => {
        this.reportData = res.report;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }
}
