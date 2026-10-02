import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../../core/services/document.service';

@Component({
  selector: 'app-student-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="documents-page container">
      <div class="page-header card">
        <div>
          <h2>Document Repository</h2>
          <p>Manage all your uploaded certificates, marksheets, and identification proofs.</p>
        </div>
        <div class="upload-trigger">
          <label class="btn btn-primary">
            <span class="material-icons">cloud_upload</span> Upload New Document
            <input type="file" (change)="onUpload($event)" hidden />
          </label>
        </div>
      </div>

      <!-- Quick Upload Selector -->
      <div class="upload-bar card" *ngIf="showUploadConfig">
        <div class="form-row">
          <div class="form-group">
            <label>Document Category</label>
            <select [(ngModel)]="selectedType">
              <option value="PHOTO">Passport Photo</option>
              <option value="SIGNATURE">Candidate Signature</option>
              <option value="CLASS_10_MARKSHEET">Class 10 Marksheet</option>
              <option value="CLASS_12_MARKSHEET">Class 12 Marksheet</option>
              <option value="ENTRANCE_SCORECARD">Entrance Exam Rank Card</option>
              <option value="AADHAAR_CARD">Aadhaar Card / ID Proof</option>
              <option value="CATEGORY_CERTIFICATE">Category / Caste Certificate</option>
            </select>
          </div>
          <div class="form-group">
            <label>Document Title</label>
            <input type="text" [(ngModel)]="documentTitle" placeholder="e.g. CBSE 10th Original" />
          </div>
          <div class="action-col">
            <button class="btn btn-success" (click)="confirmUpload()" [disabled]="!selectedFile">Confirm Upload</button>
            <button class="btn btn-outline" (click)="cancelUpload()">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Documents Grid -->
      <div class="docs-grid" *ngIf="!isLoading">
        <div class="doc-card card" *ngFor="let doc of documents">
          <div class="doc-card-header">
            <div class="file-badge">
              <span class="material-icons">description</span>
            </div>
            <span class="badge" [class.badge-approved]="doc.status === 'VERIFIED'" [class.badge-under_review]="doc.status === 'PENDING'" [class.badge-rejected]="doc.status === 'REJECTED'">
              {{ doc.status }}
            </span>
          </div>

          <h4>{{ doc.title || doc.documentType.replace('_', ' ') }}</h4>
          <p class="file-name">{{ doc.originalFileName }}</p>
          <span class="doc-date">Uploaded on {{ doc.createdAt | date:'mediumDate' }}</span>

          <div *ngIf="doc.verificationRemarks" class="doc-remarks">
            <strong>Remark:</strong> {{ doc.verificationRemarks }}
          </div>

          <div class="doc-card-actions">
            <button class="btn btn-danger btn-sm" (click)="deleteDoc(doc._id)" [disabled]="doc.status === 'VERIFIED'">
              <span class="material-icons">delete</span> Remove
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="documents.length === 0 && !isLoading" class="empty-docs card">
        <span class="material-icons">folder_open</span>
        <p>No documents uploaded yet. Upload your certificates to complete your application.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .documents-page { padding: 40px 20px; }
      .page-header { display: flex; justify-content: space-between; align-items: center; padding: 24px; margin-bottom: 24px; h2 { font-size: 1.6rem; margin-bottom: 4px; } p { font-size: 0.85rem; color: var(--text-muted); } }
      .upload-bar { padding: 20px; margin-bottom: 24px; background: var(--bg-subtle); .form-row { display: flex; gap: 16px; align-items: flex-end; } .form-group { flex: 1; margin-bottom: 0; } .action-col { display: flex; gap: 8px; } }
      .docs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
      .doc-card { padding: 20px; display: flex; flex-direction: column; .doc-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; .file-badge { width: 40px; height: 40px; background: rgba(11, 59, 96, 0.1); color: var(--iem-primary); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; } } h4 { font-size: 1.05rem; margin-bottom: 4px; } .file-name { font-size: 0.8rem; color: var(--text-muted); word-break: break-all; margin-bottom: 4px; } .doc-date { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px; } .doc-remarks { font-size: 0.8rem; background: rgba(245, 158, 11, 0.1); padding: 8px; border-radius: 4px; margin-bottom: 12px; } .doc-card-actions { margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border-color); } }
      .empty-docs { text-align: center; padding: 60px; color: var(--text-muted); .material-icons { font-size: 3rem; margin-bottom: 12px; } }
    `,
  ],
})
export class StudentDocumentsComponent implements OnInit {
  documentService = inject(DocumentService);

  documents: any[] = [];
  isLoading = true;
  showUploadConfig = false;
  selectedFile: File | null = null;
  selectedType = 'CLASS_10_MARKSHEET';
  documentTitle = '';

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.documentService.getMyDocuments().subscribe({
      next: (res) => {
        this.documents = res.documents || [];
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  onUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.documentTitle = file.name;
      this.showUploadConfig = true;
    }
  }

  confirmUpload(): void {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('documentType', this.selectedType);
    formData.append('title', this.documentTitle || this.selectedType);

    this.documentService.uploadDocument(formData).subscribe({
      next: () => {
        this.cancelUpload();
        this.loadDocuments();
      },
      error: (err) => alert(err.error?.message || 'Upload failed.'),
    });
  }

  cancelUpload(): void {
    this.showUploadConfig = false;
    this.selectedFile = null;
    this.documentTitle = '';
  }

  deleteDoc(id: string): void {
    if (!confirm('Are you sure you want to delete this document?')) return;
    this.documentService.deleteDocument(id).subscribe({
      next: () => this.loadDocuments(),
      error: (err) => alert(err.error?.message || 'Could not delete document.'),
    });
  }
}
