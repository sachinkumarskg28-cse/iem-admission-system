import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent],
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss'],
})
export class ApplicationDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  applicationService = inject(ApplicationService);

  application: any = null;
  documents: any[] = [];
  isLoading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadApplication(id);
    }
  }

  loadApplication(id: string): void {
    this.isLoading = true;
    this.applicationService.getApplicationById(id).subscribe({
      next: (res) => {
        this.application = res.application;
        this.documents = res.documents || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  downloadPDF(): void {
    if (!this.application) return;
    this.applicationService.downloadPDF(this.application._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `IEM_Application_${this.application.applicationNumber || 'Form'}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
    });
  }
}
