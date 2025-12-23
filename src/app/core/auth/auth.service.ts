import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorage } from './token-storage';

export interface CurrentUser {
  id: number;
  username: string;
  fullName: string;
  roles: string[];

  // ✅ optional fields (để profile chỉnh sửa)
  email?: string;
  phone?: string;
  avatarUrl?: string; // link ảnh avatar
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isLoggedIn = signal(false);
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  private _currentUser = signal<CurrentUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  constructor(private tokens: TokenStorage, private router: Router) {
    this.checkInitialLoginStatus();
  }

  private checkInitialLoginStatus(): void {
    const token = this.tokens.getAccessToken();
    if (token) {
      this._isLoggedIn.set(true);
      const userJson = localStorage.getItem('currentUser');
      if (userJson) this._currentUser.set(JSON.parse(userJson));
    }
  }

  loginSuccess(accessToken: string, refreshToken?: string, user?: CurrentUser): void {
    this.tokens.saveAccessToken(accessToken);
    if (refreshToken) this.tokens.saveRefreshToken(refreshToken);

    this._isLoggedIn.set(true);
    if (user) {
      this._currentUser.set(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  /** ✅ Update thông tin user (profile page dùng) */
  updateCurrentUser(patch: Partial<CurrentUser>): void {
    const curr = this._currentUser();
    if (!curr) return;
    const next = { ...curr, ...patch };
    this._currentUser.set(next);
    localStorage.setItem('currentUser', JSON.stringify(next));
  }

  mockLogin(): void {
    this.tokens.saveAccessToken('dev-mock-jwt-token');
    this._isLoggedIn.set(true);

    const mockUser: CurrentUser = {
      id: 1,
      username: 'devuser',
      fullName: 'Developer User',
      roles: ['ADMIN'],
      email: 'dev@local',
      phone: '0000000000',
      avatarUrl: '',
    };
    this._currentUser.set(mockUser);
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
  }

  logout(): void {
    this.tokens.clear();
    this._isLoggedIn.set(false);
    this._currentUser.set(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  isLoggedInSync(): boolean {
    return this._isLoggedIn();
  }

  getCurrentUserSync(): CurrentUser | null {
    return this._currentUser();
  }
}
