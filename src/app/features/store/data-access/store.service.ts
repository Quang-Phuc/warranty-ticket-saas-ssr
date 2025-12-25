import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/http/api-client';

/** ✅ Store entity */
export interface Store {
  id: number | null;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE';
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

/** ✅ Paged response (giống License) */
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/** ✅ Request body cho search */
export interface StoreSearchReq {
  page: number;
  size: number;
  keyword?: string;
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  constructor(private api: ApiClient) {}

  /** ✅ POST search (tương tự LicenseHistory) */
  searchStores(body: StoreSearchReq): Observable<PagedResponse<Store>> {
    return this.api.postData<PagedResponse<Store>>('stores/search', body);
  }

  /** ✅ GET chi tiết store (nếu cần riêng, hoặc có thể dùng search với id) */
  getStore(id: number): Observable<Store> {
    return this.api.getData<Store>(`stores/${id}`);
  }

  /** ✅ POST tạo mới store */
  createStore(body: Partial<Store>): Observable<Store> {
    return this.api.postData<Store>('stores', body);
  }

  /** ✅ PUT update store */
  updateStore(id: number, body: Partial<Store>): Observable<Store> {
    return this.api.putData<Store>(`stores/${id}`, body);
  }

  /** ✅ DELETE store */
  deleteStore(id: number): Observable<any> {
    return this.api.deleteData<any>(`stores/${id}`);
  }
}
