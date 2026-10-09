import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h3 class="error-title">{{ title || 'Something went wrong' }}</h3>
      <p class="error-text">{{ message }}</p>
      <button *ngIf="showRetry" class="btn-retry" (click)="retry.emit()">Try Again</button>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
      gap: 0.75rem;
    }

    .error-icon { font-size: 2.5rem; }

    .error-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text);
      margin: 0;
    }

    .error-text {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .btn-retry {
      margin-top: 0.5rem;
      padding: 0.5rem 1.25rem;
      background: #4361ee;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover { background: #2a4dd0; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMessageComponent {
  @Input() title = '';
  @Input() message = 'An unexpected error occurred.';
  @Input() showRetry = false;
  @Output() retry = new EventEmitter<void>();
}
