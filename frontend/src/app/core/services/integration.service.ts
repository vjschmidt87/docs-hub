import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Integration } from '@core/models/document.models';

@Injectable({ providedIn: 'root' })
export class IntegrationService {
  private readonly API_URL = `${environment.apiUrl}/integrations`;

  constructor(private http: HttpClient) {}

  getIntegrations(): Observable<Integration[]> {
    return this.http.get<Integration[]>(this.API_URL);
  }

  connectService(service: string, email: string): Observable<Integration> {
    return this.http.post<Integration>(`${this.API_URL}/${service}/connect`, { email });
  }

  disconnectService(service: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${service}`);
  }
}
