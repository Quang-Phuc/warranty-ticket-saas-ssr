// src/app/core/http/api-client.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models';

export type ApiClientOptions = {
  /**
   * silent = true  => KHÔNG show toast lỗi (interceptor sẽ bỏ qua)
   * silent = false => interceptor tự show toast lỗi
   */
  silent?: boolean;

  /**
   * Custom headers nếu cần
   */
  headers?: HttpHeaders | Record<string, string>;
};

@Injectable({
  providedIn: 'root',
})
export class ApiClient {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;

    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return httpParams;
  }

  private buildHeaders(options?: ApiClientOptions): HttpHeaders | undefined {
    let headers: HttpHeaders | undefined;

    // normalize headers
    if (options?.headers instanceof HttpHeaders) {
      headers = options.headers;
    } else if (options?.headers && typeof options.headers === 'object') {
      headers = new HttpHeaders(options.headers);
    }

    // silent -> add skip toast header for interceptor
    if (options?.silent) {
      headers = (headers ?? new HttpHeaders()).set('x-skip-error-toast', '1');
    }

    return headers;
  }

  get<T = any>(
    endpoint: string,
    params?: any,
    options?: ApiClientOptions
  ): Observable<ApiResponse<T>> {
    const httpParams = this.buildParams(params);
    const headers = this.buildHeaders(options);

    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, {
      params: httpParams,
      headers,
    });
  }

  post<T = any>(
    endpoint: string,
    body: any = {},
    options?: ApiClientOptions
  ): Observable<ApiResponse<T>> {
    const headers = this.buildHeaders(options);

    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body, {
      headers,
    });
  }

  put<T = any>(
    endpoint: string,
    body: any,
    options?: ApiClientOptions
  ): Observable<ApiResponse<T>> {
    const headers = this.buildHeaders(options);

    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body, {
      headers,
    });
  }

  patch<T = any>(
    endpoint: string,
    body: any,
    options?: ApiClientOptions
  ): Observable<ApiResponse<T>> {
    const headers = this.buildHeaders(options);

    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body, {
      headers,
    });
  }

  delete<T = any>(
    endpoint: string,
    options?: ApiClientOptions
  ): Observable<ApiResponse<T>> {
    const headers = this.buildHeaders(options);

    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, {
      headers,
    });
  }
}
////return this.api.post<LoginData>('auth/login', body, { silent: true });
