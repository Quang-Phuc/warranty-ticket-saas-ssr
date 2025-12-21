import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorage } from './token-storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokens = inject(TokenStorage);
  const token = tokens.get();
  if (!token) return next(req);

  return next(req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }));
};
