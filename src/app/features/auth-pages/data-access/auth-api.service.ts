import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/http/api-client';

export interface RegisterRequest {
  industryId: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  // tuỳ backend trả gì, để any cũng được
  userId?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(private api: ApiClient) {}

  // ✅ baseUrl = http://localhost:8080/api
  // ✅ endpoint = auth/register  => POST http://localhost:8080/api/auth/register
  register(payload: RegisterRequest): Observable<any> {
    return this.api.post<RegisterResponse>('auth/register', payload);
  }
}
