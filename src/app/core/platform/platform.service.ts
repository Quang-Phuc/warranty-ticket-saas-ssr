import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class PlatformService {
  private platformId = inject(PLATFORM_ID);

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /** SSR-safe localStorage wrapper */
  getStorage(): Storage | null {
    return this.isBrowser ? window.localStorage : null;
  }
}
