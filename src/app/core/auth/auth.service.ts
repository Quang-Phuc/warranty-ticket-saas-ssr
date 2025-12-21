// src/app/core/auth/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorage } from './token-storage';

export interface CurrentUser {
  id: number;
  username: string;
  fullName: string;
  roles: string[];
  // Thêm các field khác nếu backend trả về (email, avatar, ...)
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Signal để theo dõi trạng thái đăng nhập (reactive, dễ dùng với Angular 16+)
  private _isLoggedIn = signal(false);
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  // Lưu thông tin user hiện tại (có thể dùng để hiển thị tên, avatar ở topbar...)
  private _currentUser = signal<CurrentUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  constructor(
    private tokens: TokenStorage,
    private router: Router
  ) {
    // Khởi động app: kiểm tra xem đã có token chưa
    this.checkInitialLoginStatus();
  }

  /** Kiểm tra token khi app khởi động */
  private checkInitialLoginStatus(): void {
    const token = this.tokens.getAccessToken();
    if (token) {
      this._isLoggedIn.set(true);

      // Optional: lấy user info từ localStorage nếu bạn lưu khi login
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        this._currentUser.set(JSON.parse(userJson));
      }
    }
  }

  /** Đăng nhập thành công - gọi từ LoginPage sau khi API trả về thành công */
  loginSuccess(accessToken: string, refreshToken?: string, user?: CurrentUser): void {
    this.tokens.saveAccessToken(accessToken);
    if (refreshToken) {
      this.tokens.saveRefreshToken(refreshToken);
    }

    this._isLoggedIn.set(true);

    if (user) {
      this._currentUser.set(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  /** Mock login - giữ lại để dev/demo nhanh */
  mockLogin(): void {
    this.tokens.saveAccessToken('dev-mock-jwt-token');
    this._isLoggedIn.set(true);

    // Mock user data
    const mockUser: CurrentUser = {
      id: 1,
      username: 'devuser',
      fullName: 'Developer User',
      roles: ['ADMIN']
    };
    this._currentUser.set(mockUser);
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
  }

  /** Đăng xuất */
  logout(): void {
    this.tokens.clear();
    this._isLoggedIn.set(false);
    this._currentUser.set(null);
    localStorage.removeItem('currentUser');

    // Redirect về login
    this.router.navigate(['/login']);
  }

  /** Getter tiện ích (nếu vẫn muốn dùng kiểu cũ) */
  isLoggedInSync(): boolean {
    return this._isLoggedIn();
  }

  /** Lấy user hiện tại (sync) */
  getCurrentUserSync(): CurrentUser | null {
    return this._currentUser();
  }
}
