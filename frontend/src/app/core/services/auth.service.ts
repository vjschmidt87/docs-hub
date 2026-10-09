import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@core/models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());

  currentUser$ = this.currentUserSubject.asObservable();
  isLoggedIn$ = new BehaviorSubject<boolean>(!!this.getToken());

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    localStorage.removeItem('docs_hub_token');
    localStorage.removeItem('docs_hub_user');
    this.currentUserSubject.next(null);
    this.isLoggedIn$.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('docs_hub_token');
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('docs_hub_token', response.token);
    const user: User = { username: response.username, email: response.email };
    localStorage.setItem('docs_hub_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isLoggedIn$.next(true);
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem('docs_hub_user');
    return userStr ? JSON.parse(userStr) : null;
  }
}
