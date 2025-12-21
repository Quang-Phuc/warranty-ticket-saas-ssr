// src/app/core/auth/token-storage.ts
import { Injectable } from '@angular/core';
import { PlatformService } from '../platform/platform.service';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

@Injectable({
  providedIn: 'root'
})
export class TokenStorage {
  constructor(private platform: PlatformService) {}

  /** Lấy access token */
  getAccessToken(): string | null {
    return this.platform.getStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
  }

  /** Lưu access token */
  saveAccessToken(token: string): void {
    this.platform.getStorage()?.setItem(ACCESS_TOKEN_KEY, token);
  }

  /** Lấy refresh token (nếu có) */
  getRefreshToken(): string | null {
    return this.platform.getStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
  }

  /** Lưu refresh token (nếu backend trả về) */
  saveRefreshToken(token: string): void {
    this.platform.getStorage()?.setItem(REFRESH_TOKEN_KEY, token);
  }

  /** Xóa toàn bộ token */
  clear(): void {
    const storage = this.platform.getStorage();
    if (storage) {
      storage.removeItem(ACCESS_TOKEN_KEY);
      storage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  /** Kiểm tra có access token hợp lệ hay không (có thể mở rộng validate JWT sau) */
  hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }
}
