import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { TranslationService } from '@core/i18n/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">📄</div>
        <h1 class="auth-title">{{ t.t('auth.loginTitle') }}</h1>
        <p class="auth-subtitle">{{ t.t('auth.loginSubtitle') }}</p>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label">{{ t.t('auth.username') }}</label>
            <input
              class="form-input"
              type="text"
              [(ngModel)]="username"
              name="username"
              [placeholder]="t.t('auth.username')"
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label class="form-label">{{ t.t('auth.password') }}</label>
            <input
              class="form-input"
              type="password"
              [(ngModel)]="password"
              name="password"
              [placeholder]="t.t('auth.password')"
              autocomplete="current-password"
            />
          </div>

          <div *ngIf="errorMessage" class="error-alert">{{ errorMessage }}</div>

          <button type="submit" class="btn-submit" [disabled]="isLoading">
            {{ isLoading ? t.t('loading.default') : t.t('auth.loginBtn') }}
          </button>
        </form>

        <p class="auth-switch">
          {{ t.t('auth.noAccount') }}
          <a routerLink="/register">{{ t.t('auth.signUp') }}</a>
        </p>
      </div>
    </div>
  `,
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly t = inject(TranslationService);

  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/documents']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid username or password.';
      },
    });
  }
}
