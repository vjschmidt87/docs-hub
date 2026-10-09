import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { TranslationService } from '@core/i18n/translation.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">📄</div>
        <h1 class="auth-title">{{ t.t('auth.registerTitle') }}</h1>
        <p class="auth-subtitle">{{ t.t('auth.registerSubtitle') }}</p>

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
            <label class="form-label">{{ t.t('auth.email') }}</label>
            <input
              class="form-input"
              type="email"
              [(ngModel)]="email"
              name="email"
              [placeholder]="t.t('auth.email')"
              autocomplete="email"
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
              autocomplete="new-password"
            />
          </div>

          <div *ngIf="errorMessage" class="error-alert">{{ errorMessage }}</div>

          <button type="submit" class="btn-submit" [disabled]="isLoading">
            {{ isLoading ? t.t('loading.default') : t.t('auth.registerBtn') }}
          </button>
        </form>

        <p class="auth-switch">
          {{ t.t('auth.hasAccount') }}
          <a routerLink="/login">{{ t.t('auth.signIn') }}</a>
        </p>
      </div>
    </div>
  `,
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly t = inject(TranslationService);

  username = '';
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  onSubmit(): void {
    if (!this.username || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register({ username: this.username, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/documents']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      },
    });
  }
}
