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

/** ✅ EXPORT */
export interface LicenseHistoryEntry {
  id: number;
  packageName: string;
  purchaseDate: string;
  amountPaid: number;
  userId: number;
  status: string;
  note?: string;
  storeId?: string;

  // ✅ nếu backend có trả ảnh
  images?: string[];
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/** ✅ request body search */
export interface LicenseHistorySearchReq {
  page: number;
  size: number;
  keyword?: string;
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

  /** ✅ POST search (backend search) */
  searchLicenseHistory(body: {
    size: number;
    page: number;
    keyword: string;
    storeId: number | null
  }): Observable<PagedResponse<LicenseHistoryEntry>> {
    return this.api.postData<PagedResponse<LicenseHistoryEntry>>('license-history/search', body);
  }

  /** ✅ update history */
  updateLicenseHistory(id: number, body: { status: string; note: string }): Observable<any> {
    return this.api.putData<any>(`license-history/${id}`, body);
  }

  /** ✅ delete history */
  deleteLicenseHistory(id: number): Observable<any> {
    return this.api.deleteData<any>(`license-history/${id}`);
  }

  /** ✅ CREATE history (multipart) */
  createLicenseHistory(formData: FormData): Observable<any> {
    return this.api.postMultipart<any>('license-history/create', formData);
  }
}
