import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'documents', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('@features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('@features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'documents',
    loadComponent: () => import('@features/documents/document-list/document-list.component').then(m => m.DocumentListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'documents/upload',
    loadComponent: () => import('@features/documents/document-upload/document-upload.component').then(m => m.DocumentUploadComponent),
    canActivate: [authGuard]
  },
  {
    path: 'settings/integrations',
    loadComponent: () => import('@features/settings/integrations/integrations.component').then(m => m.IntegrationsComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'documents' }
];
