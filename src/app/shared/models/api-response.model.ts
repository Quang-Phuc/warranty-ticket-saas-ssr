// src/app/shared/models/api.model.ts

export interface ApiMessages {
  vn?: string;
  en?: string;
  [k: string]: string | undefined;
}

// Success envelope
export interface ApiSuccess<T> {
  timeStamp: string;
  securityVersion: string;
  result: 'success';
  message: string;      // "OK"
  errorCode: string;    // "200"
  data?: T;
}

// Error body (backend mới)
export interface ApiFail {
  code: string;         // "SS004"
  messages: ApiMessages;
}

// Union
export type ApiEnvelope<T> = ApiSuccess<T> | ApiFail | (ApiSuccess<T> & { result: 'error' });

// Error normalized để toàn app dùng chung
export interface ApiNormalizedError {
  code?: string | null;
  messages?: ApiMessages;
  message?: string;
  raw?: any;
}

export function isApiFail(x: any): x is ApiFail {
  return !!x && typeof x === 'object' && typeof x.code === 'string' && typeof x.messages === 'object';
}

export function pickApiMessage(x: any, fallback = 'Đã có lỗi xảy ra'): string {
  if (!x) return fallback;
  return x?.messages?.vn || x?.message || fallback;
}

export function pickApiCode(x: any): string | null {
  return x?.code || x?.errorCode || null;
}
