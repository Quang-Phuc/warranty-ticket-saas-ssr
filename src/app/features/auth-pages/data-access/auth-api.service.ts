// src/app/features/auth/data-access/auth-api.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/http/api-client';

export interface LoginRequest { username: string; password: string; }
export interface RegisterRequest { industryId: string; phone: string;password: string }
export interface LoginData { accessToken: string; refreshToken: string; user: any; }
export interface IndustryDto { id: string | number; code?: string; name: string; }
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(private api: ApiClient) {}

  login(body: LoginRequest): Observable<LoginData> {
    return this.api.postData<LoginData>('auth/login', body);
  }

  register(body: RegisterRequest): Observable<LoginData> {
    return this.api.postData<any>('auth/register', body);
  }

  industries(): Observable<IndustryDto[]> {
    return this.api.getData<IndustryDto[]>('industries');
  }
}
