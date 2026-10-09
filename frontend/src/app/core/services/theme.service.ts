import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'docs-hub-theme';
  private readonly theme = signal<'light' | 'dark'>(this.loadTheme());
  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    this.apply(this.theme());
  }

  toggle(): void {
    const next = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    localStorage.setItem(this.STORAGE_KEY, next);
    this.apply(next);
  }

  private apply(t: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', t);
  }

  private loadTheme(): 'light' | 'dark' {
    const s = localStorage.getItem(this.STORAGE_KEY);
    if (s === 'dark' || s === 'light') return s;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
