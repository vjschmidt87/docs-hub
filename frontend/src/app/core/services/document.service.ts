import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Document } from '@core/models/document.models';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly API_URL = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  getDocuments(service?: string): Observable<Document[]> {
    let params = new HttpParams();
    if (service) {
      params = params.set('service', service);
    }
    return this.http.get<Document[]>(this.API_URL, { params });
  }

  uploadDocument(file: File, serviceType: string): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('serviceType', serviceType);
    return this.http.post<Document>(`${this.API_URL}/upload`, formData);
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
