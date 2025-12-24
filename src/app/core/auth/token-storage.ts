import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenStorage {
  private ACCESS_KEY = 'access_token';
  private REFRESH_KEY = 'refresh_token';

  saveAccessToken(token: string) {
    localStorage.setItem(this.ACCESS_KEY, token);
  }

  saveRefreshToken(token: string) {
    localStorage.setItem(this.REFRESH_KEY, token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  clear() {
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }
}
