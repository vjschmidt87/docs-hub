import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { TranslationService } from '@core/i18n/translation.service';
import { DocumentService } from '@core/services/document.service';
import { Document, ServiceType, SERVICE_LABELS, SERVICE_ICONS } from '@core/models/document.models';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '@shared/components/error-message/error-message.component';

interface FilterTab {
  key: string;
  label: string;
  serviceType?: ServiceType;
}

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, DatePipe, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">{{ t.t('documents.title') }}</h1>
        <a routerLink="/documents/upload" class="btn-upload">
          + {{ t.t('header.upload') }}
        </a>
      </div>

      <div class="filter-tabs">
        <button
          *ngFor="let tab of filterTabs"
          class="filter-tab"
          [class.active]="activeFilter() === tab.key"
          (click)="activeFilter.set(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <app-loading-spinner
        *ngIf="loading()"
        [message]="t.t('documents.loading')"
      />

      <app-error-message
        *ngIf="error() && !loading()"
        [message]="error()"
        [showRetry]="true"
        (retry)="loadDocuments()"
      />

      <div *ngIf="!loading() && !error()">
        <div *ngIf="filteredDocuments().length === 0" class="empty-state">
          <div class="empty-icon">📂</div>
          <h2>{{ t.t('documents.noDocuments') }}</h2>
          <p>{{ t.t('documents.noDocumentsHint') }}</p>
          <a routerLink="/documents/upload" class="btn-primary-link">Upload a document</a>
        </div>

        <div *ngIf="filteredDocuments().length > 0" class="documents-grid">
          <div *ngFor="let doc of filteredDocuments()" class="doc-card">
            <div class="doc-icon">{{ getMimeIcon(doc.mimeType) }}</div>
            <div class="doc-info">
              <span class="doc-name" [title]="doc.name">{{ doc.name }}</span>
              <div class="doc-meta">
                <span class="service-badge" [class]="'service-' + doc.serviceType.toLowerCase()">
                  {{ SERVICE_ICONS[doc.serviceType] }} {{ SERVICE_LABELS[doc.serviceType] }}
                </span>
                <span class="doc-date">{{ doc.modifiedAt | date:'mediumDate' }}</span>
                <span class="doc-size">{{ formatSize(doc.size) }}</span>
              </div>
            </div>
            <div class="doc-actions">
              <a [href]="doc.externalUrl" target="_blank" rel="noopener" class="action-btn" [title]="t.t('documents.open')">
                🔗
              </a>
              <a [href]="doc.downloadUrl" target="_blank" rel="noopener" class="action-btn" [title]="t.t('documents.download')">
                ⬇️
              </a>
              <button class="action-btn danger" (click)="deleteDocument(doc)" [title]="t.t('documents.remove')">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './document-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentListComponent implements OnInit {
  readonly t = inject(TranslationService);
  private readonly documentService = inject(DocumentService);

  readonly SERVICE_LABELS = SERVICE_LABELS;
  readonly SERVICE_ICONS = SERVICE_ICONS;

  documents = signal<Document[]>([]);
  loading = signal(true);
  error = signal('');
  activeFilter = signal('ALL');

  readonly filterTabs: FilterTab[] = [
    { key: 'ALL', label: 'All' },
    { key: 'GOOGLE_DRIVE', label: 'Google Drive', serviceType: 'GOOGLE_DRIVE' },
    { key: 'DROPBOX', label: 'Dropbox', serviceType: 'DROPBOX' },
    { key: 'ONEDRIVE', label: 'OneDrive', serviceType: 'ONEDRIVE' },
    { key: 'BOX', label: 'Box', serviceType: 'BOX' },
    { key: 'NOTION', label: 'Notion', serviceType: 'NOTION' },
  ];

  filteredDocuments = computed(() => {
    if (this.activeFilter() === 'ALL') return this.documents();
    return this.documents().filter(d => d.serviceType === this.activeFilter());
  });

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading.set(true);
    this.error.set('');
    this.documentService.getDocuments().subscribe({
      next: (docs) => {
        this.documents.set(docs);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load documents. Please try again.');
        this.loading.set(false);
      },
    });
  }

  deleteDocument(doc: Document): void {
    if (!confirm(`Remove "${doc.name}"?`)) return;
    this.documentService.deleteDocument(doc.id).subscribe({
      next: () => {
        this.documents.update(docs => docs.filter(d => d.id !== doc.id));
      },
    });
  }

  getMimeIcon(mimeType: string): string {
    if (!mimeType) return '📄';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📊';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('video')) return '🎬';
    if (mimeType.includes('audio')) return '🎵';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '🗜️';
    return '📄';
  }

  formatSize(bytes: number): string {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
