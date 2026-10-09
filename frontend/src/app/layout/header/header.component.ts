import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { TranslationService, Lang } from '@core/i18n/translation.service';
import { ThemeService } from '@core/services/theme.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe, NgIf],
  template: `
    <header class="header">
      <div class="header-inner">
        <a routerLink="/documents" class="logo">
          <span class="logo-icon">📄</span>
          <span class="logo-text">{{ t.t('header.logo') }}</span>
        </a>

        <nav class="nav" [class.open]="menuOpen()">
          <a routerLink="/documents" routerLinkActive="active" class="nav-link" (click)="menuOpen.set(false)">
            {{ t.t('header.documents') }}
          </a>
          <a routerLink="/documents/upload" routerLinkActive="active" class="nav-link" (click)="menuOpen.set(false)">
            {{ t.t('header.upload') }}
          </a>
          <a routerLink="/settings/integrations" routerLinkActive="active" class="nav-link" (click)="menuOpen.set(false)">
            {{ t.t('header.integrations') }}
          </a>

          <div class="nav-actions">
            <button class="icon-btn" (click)="toggleTheme()" [title]="theme.isDark() ? t.t('header.lightMode') : t.t('header.darkMode')">
              {{ theme.isDark() ? '☀️' : '🌙' }}
            </button>
            <button class="lang-toggle" (click)="toggleLang()" [title]="t.currentLang() === 'en' ? 'Mudar para Português' : 'Switch to English'">
              {{ t.currentLang() === 'en' ? 'PT-BR' : 'EN' }}
            </button>
            <ng-container *ngIf="auth.currentUser$ | async as user">
              <span class="username">{{ user.username }}</span>
              <button class="btn-logout" (click)="logout()">{{ t.t('header.logout') }}</button>
            </ng-container>
          </div>
        </nav>

        <button class="hamburger" (click)="menuOpen.set(!menuOpen())" [attr.aria-expanded]="menuOpen()">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  `,
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly t = inject(TranslationService);
  readonly theme = inject(ThemeService);
  readonly auth = inject(AuthService);
  readonly menuOpen = signal(false);

  toggleLang(): void {
    const next: Lang = this.t.currentLang() === 'en' ? 'pt-br' : 'en';
    this.t.setLang(next);
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  logout(): void {
    this.auth.logout();
    this.menuOpen.set(false);
  }
}
