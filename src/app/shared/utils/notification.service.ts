// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { pickApiMessage } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private snack: MatSnackBar) {}

  private config(typeClass: string, duration: number): MatSnackBarConfig {
    return {
      duration,
      horizontalPosition: 'right', // ✅ góc phải
      verticalPosition: 'top',     // ✅ phía trên
      panelClass: ['toast-top-right', typeClass], // ✅ class để ép vị trí bằng CSS global
    };
  }

  showSuccess(message: string) {
    this.snack.open(message, 'Đóng', this.config('snackbar-success', 2500));
  }

  showInfo(message: string) {
    this.snack.open(message, 'Đóng', this.config('snackbar-info', 3000));
  }

  showError(message: string) {
    this.snack.open(message, 'Đóng', this.config('snackbar-error', 7000));
  }

  // ✅ dùng chung cho mọi error: HttpErrorResponse / body {code,messages} / string
  showApiError(err: any, fallback = 'Đã có lỗi xảy ra') {
    const raw = err?.error ?? err;
    const msg = typeof raw === 'string' ? raw : pickApiMessage(raw, fallback);
    this.showError(msg);
  }
}
