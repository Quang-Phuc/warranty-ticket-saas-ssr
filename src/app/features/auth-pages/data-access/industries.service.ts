import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClient } from '../../../core/http/api-client';

export interface IndustryDto {
  id: string;
  name: string;
}

export interface IndustryOption {
  value: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class IndustriesService {
  constructor(private api: ApiClient) {}

  // ✅ TODO: đổi endpoint đúng theo backend của m
  // Ví dụ backend hay dùng: GET /api/public/industries hoặc /api/meta/industries
  getIndustries(): Observable<IndustryOption[]> {
    return this.api.get<IndustryDto[]>('industries').pipe(
      map((res) => (res.data ?? []).map((x) => ({ value: x.id, label: x.name })))
    );
  }
}
