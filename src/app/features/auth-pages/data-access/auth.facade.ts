// src/app/features/auth-pages/data-access/auth.facade.ts
import { Injectable } from '@angular/core';
import { AuthApi, LoginRequest, LoginResponse } from './auth.api';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  constructor(private authApi: AuthApi) {}

  login(payload: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.authApi.login(payload);
  }
}
