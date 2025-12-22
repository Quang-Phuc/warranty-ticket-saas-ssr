import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/http/api-client';

export interface ApiResponse<T> {
  result?: 'success' | 'error';
  message?: string;
  data?: T;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  user: any;
}

export interface RegisterRequest {
  industryId: string;
  phone: string;
  password: string;
}

export interface IndustryDto {
  id: string | number;
  code?: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(private api: ApiClient) {}

  // POST /api/auth/login
  login(body: LoginRequest): Observable<ApiResponse<LoginData>> {
    return this.api.post<LoginData>('auth/login', body);
  }

  // POST /api/auth/register
  register(body: RegisterRequest): Observable<ApiResponse<any>> {
    return this.api.post<any>('auth/register', body);
  }

  // GET /api/industries
  industries(): Observable<ApiResponse<IndustryDto[]>> {
    return this.api.get<IndustryDto[]>('industries');
  }
}
