import { Injectable } from '@angular/core';
import { PlatformService } from '../platform/platform.service';

const KEY = 'access_token';

@Injectable({ providedIn: 'root' })
export class TokenStorage {
  constructor(private platform: PlatformService) {}

  get(): string | null {
    return this.platform.getStorage()?.getItem(KEY) ?? null;
  }

  set(token: string): void {
    this.platform.getStorage()?.setItem(KEY, token);
  }

  clear(): void {
    this.platform.getStorage()?.removeItem(KEY);
  }
}
