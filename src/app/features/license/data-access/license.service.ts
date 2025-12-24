// src/app/core/services/license.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/http/api-client';

export interface LicensePlan {
  id: number;
  name: string;
  description?: string | null;
  maxStore: number;
  maxUserPerStore: number;
  price: number;
  discount: number;
  durationDays: number;

  // UI
  isPopular?: boolean;
  features?: string[];
  themeColor?: 'green' | 'blue' | 'purple' | 'orange';
}

export interface QrResponse {
  base64Data: string;
}

export interface ConfirmRequest {
  licensePackageId: number;
  transactionCode: string;
}

export interface ConfirmResponse {
  success: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class LicenseService {
  constructor(private api: ApiClient) {}

  // ✅ GET /api/license-packages
  getLicensePlans(): Observable<LicensePlan[]> {
    return this.api.getData<LicensePlan[]>('license-packages');
  }

  // ✅ POST /api/license-packages/qr
  createQrCode(price: number, content: string): Observable<QrResponse> {
    return this.api.postData<QrResponse>('license-packages/qr', {
      price,
      content,
    });
  }

  // ✅ POST /api/license-packages/confirm
  confirmPayment(body: ConfirmRequest): Observable<ConfirmResponse> {
    return this.api.postData<ConfirmResponse>('license-packages/confirm', body);
  }
}
