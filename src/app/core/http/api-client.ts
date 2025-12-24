// src/app/core/http/api-client.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiEnvelope, isApiFail, pickApiMessage, pickApiCode } from '../../shared/models';
import { TokenStorage } from '../auth/token-storage'; // ✅ THÊM

export type ApiClientOptions = {
  silent?: boolean;           // không toast HTTP error (interceptor skip)
  successToast?: string;      // nếu muốn auto toast success
};

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private tokens: TokenStorage // ✅ THÊM
  ) {}

  private buildParams(params?: any): HttpParams {
    let p = new HttpParams();
    if (!params) return p;
    Object.keys(params).forEach((k) => {
      const v = params[k];
      if (v !== null && v !== undefined) p = p.set(k, String(v));
    });
    return p;
  }

  // ✅ ONLY CHANGE HERE: add Authorization header if token exists
  private buildHeaders(options?: ApiClientOptions): HttpHeaders | undefined {
    let headers = new HttpHeaders();

    if (options?.silent) headers = headers.set('x-skip-error-toast', '1');

    const token = this.tokens.getAccessToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * ✅ Hàm “chuẩn hoá”:
   * - Success envelope => trả về data
   * - Body error (result='error' hoặc {code,messages}) => throwError(...) để interceptor / component bắt
   */
  private unwrapData<T>(envelope: any): Observable<T> {
    if (isApiFail(envelope)) {
      return throwError(() => ({ error: envelope }));
    }

    if (envelope?.result === 'success') {
      return new Observable<T>((sub) => {
        sub.next(envelope.data as T);
        sub.complete();
      });
    }

    if (envelope?.result === 'error') {
      const normalized = {
        code: pickApiCode(envelope),
        messages: envelope?.messages,
        message: pickApiMessage(envelope),
        raw: envelope,
      };
      return throwError(() => ({ error: normalized }));
    }

    return throwError(() => ({ error: { message: 'Sai định dạng response', raw: envelope } }));
  }

  getData<T>(endpoint: string, params?: any, options?: ApiClientOptions): Observable<T> {
    const httpParams = this.buildParams(params);
    const headers = this.buildHeaders(options);

    return this.http
      .get<ApiEnvelope<T>>(`${this.baseUrl}/${endpoint}`, { params: httpParams, headers })
      .pipe(
        map((envelope) => envelope as any),
        catchError((err) => throwError(() => err)),
      )
      .pipe((source) =>
        new Observable<T>((sub) => {
          const s = source.subscribe({
            next: (env) => {
              this.unwrapData<T>(env).subscribe({
                next: (data) => {
                  sub.next(data);
                  sub.complete();
                },
                error: (e) => sub.error(e),
              });
            },
            error: (e) => sub.error(e),
          });
          return () => s.unsubscribe();
        })
      );
  }

  postData<T>(endpoint: string, body: any = {}, options?: ApiClientOptions): Observable<T> {
    const headers = this.buildHeaders(options);

    return this.http
      .post<ApiEnvelope<T>>(`${this.baseUrl}/${endpoint}`, body, { headers })
      .pipe((source) =>
        new Observable<T>((sub) => {
          const s = source.subscribe({
            next: (env) => {
              this.unwrapData<T>(env).subscribe({
                next: (data) => {
                  sub.next(data);
                  sub.complete();
                },
                error: (e) => sub.error(e),
              });
            },
            error: (e) => sub.error(e),
          });
          return () => s.unsubscribe();
        })
      );
  }

  putData<T>(endpoint: string, body: any, options?: ApiClientOptions): Observable<T> {
    const headers = this.buildHeaders(options);

    return this.http
      .put<ApiEnvelope<T>>(`${this.baseUrl}/${endpoint}`, body, { headers })
      .pipe((source) =>
        new Observable<T>((sub) => {
          const s = source.subscribe({
            next: (env) => {
              this.unwrapData<T>(env).subscribe({
                next: (data) => {
                  sub.next(data);
                  sub.complete();
                },
                error: (e) => sub.error(e),
              });
            },
            error: (e) => sub.error(e),
          });
          return () => s.unsubscribe();
        })
      );
  }
}
