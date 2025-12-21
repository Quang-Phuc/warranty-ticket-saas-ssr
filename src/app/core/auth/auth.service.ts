import { Injectable } from '@angular/core';
import { TokenStorage } from './token-storage';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private tokens: TokenStorage) {}

  isLoggedIn(): boolean {
    return !!this.tokens.get();
  }

  mockLogin(): void {
    this.tokens.set('dev-token');
  }

  logout(): void {
    this.tokens.clear();
  }
}
