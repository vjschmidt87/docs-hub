import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { TranslationService } from '@core/i18n/translation.service';
import { DocumentService } from '@core/services/document.service';
import { IntegrationService } from '@core/services/integration.service';
import { Integration, SERVICE_LABELS, SERVICE_ICONS } from '@core/models/document.models';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf, NgFor],
  template: `
    <div class="page">
      <div class="page-header">
        <a routerLink="/documents" class="back-link">← Back to Documents</a>
        <h1 class="page-title">{{ t.t('upload.title') }}</h1>
      </div>

      <div class="upload-card">
        <div
          class="dropzone"
          [class.dragging]="isDragging()"
          [class.has-file]="file()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave()"
          (drop)="onDrop($event)"
          (click)="fileInput.click()"
        >
          <input
            #fileInput
            type="file"
            (change)="onFileSelect($event)"
            style="display:none"
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.csv,.png,.jpg,.jpeg,.gif,.svg,.zip"
          />
          <ng-container *ngIf="!file()">
            <div class="dropzone-icon">📎</div>
            <p class="dropzone-text">{{ t.t('upload.dropzone') }}</p>
            <p class="dropzone-hint">{{ t.t('upload.dropzoneHint') }}</p>
          </ng-container>
          <ng-container *ngIf="file()">
            <div class="dropzone-icon">✅</div>
            <p class="dropzone-text">{{ file()!.name }}</p>
            <p class="dropzone-hint">{{ formatSize(file()!.size) }} — {{ t.t('upload.changeFile') }}</p>
          </ng-container>
        </div>

        <div class="form-group">
          <label class="form-label">{{ t.t('upload.destination') }}</label>
          <ng-container *ngIf="integrations().length > 0; else noServices">
            <select class="form-select" [(ngModel)]="selectedService">
              <option *ngFor="let integration of integrations()" [value]="integration.serviceType">
                {{ SERVICE_ICONS[integration.serviceType] }} {{ SERVICE_LABELS[integration.serviceType] }}
                ({{ integration.linkedEmail }})
              </option>
            </select>
          </ng-container>
          <ng-template #noServices>
            <p class="no-services-msg">
              {{ t.t('upload.noServices') }}
              <a routerLink="/settings/integrations">{{ t.t('upload.linkService') }}</a>
            </p>
          </ng-template>
        </div>

        <div *ngIf="successMessage()" class="success-alert">{{ successMessage() }}</div>
        <div *ngIf="errorMessage()" class="error-alert">{{ errorMessage() }}</div>

        <button
          class="btn-upload"
          (click)="upload()"
          [disabled]="!file() || !selectedService || uploading()"
        >
          {{ uploading() ? t.t('upload.uploading') : t.t('upload.uploadBtn') }}
        </button>
      </div>
    </div>
  `,
  styleUrl: './document-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentUploadComponent implements OnInit {
  readonly t = inject(TranslationService);
  private readonly documentService = inject(DocumentService);
  private readonly integrationService = inject(IntegrationService);
  private readonly router = inject(Router);

  readonly SERVICE_LABELS = SERVICE_LABELS;
  readonly SERVICE_ICONS = SERVICE_ICONS;

  file = signal<File | null>(null);
  uploading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  isDragging = signal(false);
  integrations = signal<Integration[]>([]);
  selectedService = '';

  ngOnInit(): void {
    this.integrationService.getIntegrations().subscribe({
      next: (integrations) => {
        const active = integrations.filter(i => i.active);
        this.integrations.set(active);
        if (active.length > 0) {
          this.selectedService = active[0].serviceType;
        }
      },
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.file.set(files[0]);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file.set(input.files[0]);
    }
  }

  upload(): void {
    if (!this.file() || !this.selectedService) return;

    this.uploading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.documentService.uploadDocument(this.file()!, this.selectedService).subscribe({
      next: () => {
        this.uploading.set(false);
        this.successMessage.set(this.t.t('upload.success'));
        this.file.set(null);
        setTimeout(() => this.router.navigate(['/documents']), 1500);
      },
      error: () => {
        this.uploading.set(false);
        this.errorMessage.set(this.t.t('upload.error'));
      },
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
