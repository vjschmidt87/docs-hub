import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { TranslationService } from '@core/i18n/translation.service';
import { IntegrationService } from '@core/services/integration.service';
import { Integration, ServiceType, SERVICE_LABELS } from '@core/models/document.models';

interface ServiceCard {
  type: ServiceType;
  icon: string;
  name: string;
  desc: string;
}

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  template: `
    <div class="page">
      <h1 class="page-title">{{ t.t('integrations.title') }}</h1>
      <p class="page-subtitle">{{ t.t('integrations.subtitle') }}</p>

      <div class="services-grid">
        <div *ngFor="let service of serviceCards" class="service-card">
          <div class="service-header">
            <div class="service-icon">{{ service.icon }}</div>
            <div class="service-info">
              <h3 class="service-name">{{ service.name }}</h3>
              <p class="service-desc">{{ service.desc }}</p>
            </div>
          </div>

          <ng-container *ngIf="getIntegration(service.type) as integration">
            <div *ngIf="integration.active" class="connected-badge">
              <span class="badge-dot"></span> {{ t.t('integrations.connected') }}
            </div>
            <p *ngIf="integration.active" class="linked-email">
              {{ t.t('integrations.linkedAs') }}: {{ integration.linkedEmail }}
            </p>
          </ng-container>

          <div class="service-actions">
            <ng-container *ngIf="isConnected(service.type); else connectBlock">
              <button class="btn-disconnect" (click)="disconnect(service.type)">
                {{ t.t('integrations.disconnect') }}
              </button>
            </ng-container>
            <ng-template #connectBlock>
              <ng-container *ngIf="connectingService() === service.type; else connectBtn">
                <div class="connect-form">
                  <input
                    class="form-input"
                    type="email"
                    [(ngModel)]="connectEmail"
                    [placeholder]="t.t('integrations.emailPlaceholder')"
                  />
                  <div class="connect-form-actions">
                    <button class="btn-confirm" (click)="confirmConnect(service.type)">
                      {{ t.t('integrations.confirmConnect') }}
                    </button>
                    <button class="btn-cancel" (click)="connectingService.set(null)">
                      {{ t.t('integrations.cancel') }}
                    </button>
                  </div>
                </div>
              </ng-container>
              <ng-template #connectBtn>
                <button class="btn-connect" (click)="startConnect(service.type)">
                  {{ t.t('integrations.connect') }}
                </button>
              </ng-template>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './integrations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationsComponent implements OnInit {
  readonly t = inject(TranslationService);
  private readonly integrationService = inject(IntegrationService);

  integrations = signal<Integration[]>([]);
  connectingService = signal<ServiceType | null>(null);
  connectEmail = '';

  readonly serviceCards: ServiceCard[] = [
    { type: 'GOOGLE_DRIVE', icon: '📁', name: 'Google Drive', desc: 'Access and upload documents to Google Drive' },
    { type: 'DROPBOX', icon: '📦', name: 'Dropbox', desc: 'Sync your Dropbox files' },
    { type: 'ONEDRIVE', icon: '☁️', name: 'OneDrive', desc: 'Access your Microsoft OneDrive files' },
    { type: 'BOX', icon: '🗃️', name: 'Box', desc: 'Connect your Box cloud storage' },
    { type: 'NOTION', icon: '📝', name: 'Notion', desc: 'Browse and upload to your Notion workspace' },
  ];

  ngOnInit(): void {
    this.loadIntegrations();
  }

  loadIntegrations(): void {
    this.integrationService.getIntegrations().subscribe({
      next: (integrations) => this.integrations.set(integrations),
    });
  }

  getIntegration(serviceType: ServiceType): Integration | undefined {
    return this.integrations().find(i => i.serviceType === serviceType);
  }

  isConnected(serviceType: ServiceType): boolean {
    const integration = this.getIntegration(serviceType);
    return !!integration?.active;
  }

  startConnect(serviceType: ServiceType): void {
    this.connectingService.set(serviceType);
    this.connectEmail = '';
  }

  confirmConnect(serviceType: ServiceType): void {
    if (!this.connectEmail) return;

    this.integrationService.connectService(serviceType, this.connectEmail).subscribe({
      next: (integration) => {
        this.integrations.update(list => {
          const idx = list.findIndex(i => i.serviceType === serviceType);
          if (idx >= 0) {
            const updated = [...list];
            updated[idx] = integration;
            return updated;
          }
          return [...list, integration];
        });
        this.connectingService.set(null);
        this.connectEmail = '';
      },
    });
  }

  disconnect(serviceType: ServiceType): void {
    this.integrationService.disconnectService(serviceType).subscribe({
      next: () => {
        this.integrations.update(list =>
          list.map(i => i.serviceType === serviceType ? { ...i, active: false, linkedEmail: '' } : i)
        );
      },
    });
  }
}
