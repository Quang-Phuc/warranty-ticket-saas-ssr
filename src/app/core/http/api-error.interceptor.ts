// src/app/core/http/api-error.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { NotificationService } from '../../shared/utils/notification.service';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  // Nếu muốn bỏ qua toast cho 1 số request:
  // req = req.clone({ headers: req.headers.set('x-skip-error-toast', '1') })
  const skipToast = req.headers.get('x-skip-error-toast') === '1';

  return next(req).pipe(
    catchError((err) => {
      if (!skipToast) {
        notification.showApiError(err, 'Có lỗi khi gọi API');
      }
      return throwError(() => err);
    })
  );
};
