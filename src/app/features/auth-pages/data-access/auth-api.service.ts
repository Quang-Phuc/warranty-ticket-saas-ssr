// src/app/features/auth/data-access/auth-api.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/http/api-client';

// Menu types (match backend navGroups)
export type NavItem = {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  children?: NavItem[];
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export type UiConfig = {
  theme?: 'light' | 'dark';
};

// ✅ Match JwtResponse (backend)
export interface LoginData {
  id?: number;
  token: string;
  type?: string; // "Bearer"
  refreshToken?: string;
  userName?: string;
  emailFace?: string;
  isFace?: boolean;
  roles?: string[];

  // ✅ new
  ui?: UiConfig;
  navGroups?: NavGroup[];
}

export interface LoginRequest {
  username: string;
  password: string;
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
