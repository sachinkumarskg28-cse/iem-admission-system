import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApplicationService } from '../../core/services/application.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-track-application',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadgeComponent],
  templateUrl: './track-application.component.html',
  styleUrls: ['./track-application.component.scss'],
})
export class TrackApplicationComponent implements OnInit {
  route = inject(ActivatedRoute);
  applicationService = inject(ApplicationService);

  applicationNumber = '';
  application: any = null;
  isLoading = false;
  hasSearched = false;
  errorMessage = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['appNo']) {
        this.applicationNumber = params['appNo'];
        this.onSearch();
      }
    });
  }

  onSearch(): void {
    if (!this.applicationNumber.trim()) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.hasSearched = true;
    this.application = null;

    this.applicationService.trackApplication(this.applicationNumber.trim()).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.application = res.application;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.message || `No application found with number: ${this.applicationNumber}`;
      },
    });
  }
}
