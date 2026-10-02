import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="getBadgeClass()">
      <span class="dot"></span>
      {{ formatStatus(status) }}
    </span>
  `,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: currentColor;
      }
      .badge-approved, .badge-admitted, .badge-verified {
        background-color: rgba(16, 185, 129, 0.15);
        color: #10b981;
      }
      .badge-submitted {
        background-color: rgba(59, 130, 246, 0.15);
        color: #3b82f6;
      }
      .badge-under_review, .badge-pending {
        background-color: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
      }
      .badge-rejected, .badge-cancelled {
        background-color: rgba(239, 68, 68, 0.15);
        color: #ef4444;
      }
      .badge-draft {
        background-color: rgba(100, 116, 139, 0.15);
        color: #64748b;
      }
    `,
  ],
})
export class StatusBadgeComponent {
  @Input() status: string = 'DRAFT';

  formatStatus(status: string): string {
    return (status || 'DRAFT').replace(/_/g, ' ');
  }

  getBadgeClass(): string {
    const s = (this.status || 'draft').toLowerCase();
    return `badge-${s}`;
  }
}
