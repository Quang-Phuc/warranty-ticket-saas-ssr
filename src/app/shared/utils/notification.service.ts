// src/app/core/services/notification.service.ts

import { inject, Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarRef,
  TextOnlySnackBar,
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  /**
   * Hàm helper: Cấu hình chung cho snackbar
   */
  private getConfig(panelClass: string, duration = 5000): MatSnackBarConfig {
    return {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [panelClass],
    };
  }

  /**
   * Helper: Bóc tách message/code từ error trả về của API
   * Hỗ trợ các case phổ biến:
   * - HttpErrorResponse.error là object
   * - HttpErrorResponse.error là JSON string
   * - error.message là string
   */
  private extractApiError(
    error: any,
    fallbackMessage = 'Đã có lỗi xảy ra'
  ): { message: string; code: string | null; raw: any } {
    if (!error) return { message: fallbackMessage, code: null, raw: error };

    // Angular HttpErrorResponse thường có: error.error, error.message
    const raw = (error as any)?.error ?? (error as any)?.message ?? error;

    // raw là string: có thể là JSON string hoặc plain text
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        const message =
          parsed?.messages?.vn ||
          parsed?.message ||
          parsed?.messages?.en ||
          fallbackMessage;

        const code = parsed?.code ?? null;

        return {
          message: typeof message === 'string' ? message : JSON.stringify(message),
          code,
          raw: parsed,
        };
      } catch {
        return { message: raw || fallbackMessage, code: null, raw };
      }
    }

    // raw là object (backend trả JSON object)
    if (typeof raw === 'object') {
      const message =
        raw?.messages?.vn ||
        raw?.message ||
        raw?.messages?.en ||
        fallbackMessage;

      const code = raw?.code ?? null;

      return {
        message: typeof message === 'string' ? message : JSON.stringify(message),
        code,
        raw,
      };
    }

    // fallback
    return { message: String(raw ?? fallbackMessage), code: null, raw };
  }

  /**
   * Hiển thị thông báo thành công (màu xanh)
   */
  showSuccess(message: string): void {
    const config = this.getConfig('snackbar-success', 3000);
    this.snackBar.open(message, 'Đóng', config);
  }

  /**
   * Hiển thị thông báo thông tin (màu xanh dương)
   */
  showInfo(message: string): void {
    const config = this.getConfig('snackbar-info', 3000);
    this.snackBar.open(message, 'Đóng', config);
  }

  /**
   * Hiển thị thông báo cảnh báo (màu cam/vàng)
   */
  showWarning(message: string): void {
    const config = this.getConfig('snackbar-warning', 5000);
    this.snackBar.open(message, 'Đóng', config);
  }

  /**
   * Hiển thị snackbar đơn giản
   */
  show(message: string, action = 'Đóng', duration = 2500): void {
    this.snackBar.open(message, action, { duration });
  }

  /**
   * Hiển thị lỗi (màu đỏ)
   * - Nếu truyền string => show luôn
   * - Nếu truyền error object => tự parse message
   */
  showError(error: any, fallbackMessage = 'Đã có lỗi xảy ra'): void {
    // Nếu bạn muốn vẫn cho phép show thẳng string
    if (typeof error === 'string') {
      const config = this.getConfig('snackbar-error', 7000);
      this.snackBar.open(error, 'Đóng', config);
      return;
    }

    const { message } = this.extractApiError(error, fallbackMessage);
    const config = this.getConfig('snackbar-error', 7000);
    this.snackBar.open(message, 'Đóng', config);
  }

  /**
   * Alias rõ nghĩa để dùng khi bắt lỗi API (component chỉ cần gọi hàm này)
   */
  showApiError(error: any, fallbackMessage = 'Đã có lỗi xảy ra'): void {
    this.showError(error, fallbackMessage);
  }

  /**
   * Hiển thị thông báo xác nhận (có nút Có/Không)
   * Trả về Promise<boolean>: true = nhấn "Có", false = nhấn "Không" hoặc hết thời gian
   */
  showConfirm(
    message: string,
    confirmText = 'Có',
    cancelText = 'Không',
    duration = 10000
  ): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const config: MatSnackBarConfig = {
        duration,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['snackbar-confirm'],
      };

      const snackBarRef: MatSnackBarRef<TextOnlySnackBar> = this.snackBar.open(
        message,
        confirmText,
        config
      );

      // Nhấn nút "Có"
      snackBarRef.onAction().subscribe(() => {
        resolve(true);
        snackBarRef.dismiss();
      });

      // Hết thời gian hoặc nhấn "Đóng" hoặc "Không"
      snackBarRef.afterDismissed().subscribe(() => {
        resolve(false);
      });

      // Tự động thêm nút "Không" (vì MatSnackBar không hỗ trợ 2 action buttons)
      setTimeout(() => {
        const container = document.querySelector(
          '.snackbar-confirm .mat-mdc-snack-bar-container'
        );
        if (container && !container.querySelector('.snack-cancel-btn')) {
          const cancelBtn = document.createElement('button');
          cancelBtn.textContent = cancelText;
          cancelBtn.className = 'snack-cancel-btn';
          cancelBtn.style.cssText = `
            background: transparent;
            border: none;
            color: #d32f2f;
            font-weight: 500;
            cursor: pointer;
            margin-left: 12px;
            font-size: 0.875rem;
          `;
          cancelBtn.onclick = (e) => {
            e.stopPropagation();
            resolve(false);
            snackBarRef.dismiss();
          };
          container.appendChild(cancelBtn);
        }
      }, 0);
    });
  }
}
