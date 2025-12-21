import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../config/env.tokens';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);

  get<T>(path: string, params?: Record<string, string | number | boolean>) {
    return this.http.get<T>(`${this.baseUrl}${path}`, { params: params as any });
  }

  post<T>(path: string, body: unknown) {
    return this.http.post<T>(`${this.baseUrl}${path}`, body);
  }
}
