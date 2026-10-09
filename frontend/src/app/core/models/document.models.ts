export type ServiceType = 'GOOGLE_DRIVE' | 'DROPBOX' | 'ONEDRIVE' | 'BOX' | 'NOTION' | 'LOCAL';

export interface Document {
  id: number;
  name: string;
  mimeType: string;
  size: number;
  externalUrl: string;
  downloadUrl: string;
  serviceType: ServiceType;
  modifiedAt: string;
}

export interface Integration {
  id: number;
  serviceType: ServiceType;
  active: boolean;
  linkedEmail: string;
  linkedAt: string;
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  GOOGLE_DRIVE: 'Google Drive',
  DROPBOX: 'Dropbox',
  ONEDRIVE: 'OneDrive',
  BOX: 'Box',
  NOTION: 'Notion',
  LOCAL: 'Local',
};

export const SERVICE_ICONS: Record<ServiceType, string> = {
  GOOGLE_DRIVE: '📁',
  DROPBOX: '📦',
  ONEDRIVE: '☁️',
  BOX: '🗃️',
  NOTION: '📝',
  LOCAL: '💾',
};
