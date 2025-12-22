// src/app/features/auth-pages/data-access/auth.api.ts
import { Injectable } from '@angular/core';
import { ApiClient } from '../../../core/http/api-client';
import { ApiResponse } from '../../../shared/models';
import { Observable } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    username: string;
    fullName: string;
    roles: string[];
    // thêm các field khác nếu backend trả về
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthApi {
  constructor(private api: ApiClient) {}

  login(payload: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.api.post<LoginResponse>('auth/login', payload);
  }

  // Có thể thêm các API khác sau này: forgotPassword, resetPassword, refreshToken...
}
