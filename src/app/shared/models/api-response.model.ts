// src/app/shared/models/api-response.model.ts
export interface ApiResponse<T = any> {
  timeStamp: string;
  securityVersion: string;
  result: 'success' | 'error';
  message: string;
  errorCode: string;
  data?: T;
}

export interface ApiErrorResponse {
  timeStamp: string;
  securityVersion: string;
  result: 'error';
  message: string;
  errorCode: string;
  data?: null;
}
