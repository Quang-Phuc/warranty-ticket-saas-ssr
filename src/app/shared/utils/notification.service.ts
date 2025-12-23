// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { pickApiMessage } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private snack: MatSnackBar) {}

  showSuccess(message: string) {
    this.snack.open(message, 'Đóng', { duration: 2500, panelClass: ['snackbar-success'] });
  }

  showInfo(message: string) {
    this.snack.open(message, 'Đóng', { duration: 3000, panelClass: ['snackbar-info'] });
  }

  showError(message: string) {
    this.snack.open(message, 'Đóng', { duration: 7000, panelClass: ['snackbar-error'] });
  }

  // ✅ dùng chung cho mọi error: HttpErrorResponse / body {code,messages} / string
  showApiError(err: any, fallback = 'Đã có lỗi xảy ra') {
    const raw = err?.error ?? err;
    const msg = typeof raw === 'string' ? raw : pickApiMessage(raw, fallback);
    this.showError(msg);
  }
}
