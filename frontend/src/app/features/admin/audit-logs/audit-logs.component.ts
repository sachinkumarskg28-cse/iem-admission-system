import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="audit-logs-page container">
      <div class="page-header card">
        <div>
          <h2>System Audit Trail & Security Logs</h2>
          <p>Trace administrative modifications, status transitions, user registrations, and payment events.</p>
        </div>
        <div class="filter-box">
          <select [(ngModel)]="moduleFilter" (change)="loadLogs()">
            <option value="">All Modules</option>
            <option value="AUTH">AUTH</option>
            <option value="APPLICATION">APPLICATION</option>
            <option value="DOCUMENT">DOCUMENT</option>
            <option value="COURSE">COURSE</option>
            <option value="PAYMENT">PAYMENT</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>

      <div class="table-card card" *ngIf="!isLoading">
        <table class="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User Email</th>
              <th>Role</th>
              <th>Module</th>
              <th>Action Performed</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of logs">
              <td>{{ log.createdAt | date:'medium' }}</td>
              <td><strong>{{ log.userEmail }}</strong></td>
              <td><span class="badge badge-submitted">{{ log.role }}</span></td>
              <td><span class="mod-tag">{{ log.module }}</span></td>
              <td><code>{{ log.action }}</code></td>
              <td><span class="details-txt">{{ formatDetails(log.details) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      .audit-logs-page { padding: 40px 20px; }
      .page-header { display: flex; justify-content: space-between; align-items: center; padding: 24px; margin-bottom: 24px; h2 { font-size: 1.6rem; margin-bottom: 4px; } p { font-size: 0.85rem; color: var(--text-muted); } }
      .table-card { padding: 0; overflow: hidden; }
      .mod-tag { font-weight: 700; font-size: 0.75rem; color: var(--iem-primary); background: rgba(11, 59, 96, 0.08); padding: 4px 8px; border-radius: 4px; }
      code { background: var(--bg-subtle); padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; }
      .details-txt { font-size: 0.75rem; color: var(--text-muted); }
    `,
  ],
})
export class AuditLogsComponent implements OnInit {
  adminService = inject(AdminService);
  logs: any[] = [];
  moduleFilter = '';
  isLoading = true;

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    this.adminService.getAuditLogs(this.moduleFilter).subscribe({
      next: (res) => {
        this.logs = res.logs || [];
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  formatDetails(details: any): string {
    if (!details) return '-';
    try {
      return typeof details === 'string' ? details : JSON.stringify(details);
    } catch {
      return '-';
    }
  }
}
