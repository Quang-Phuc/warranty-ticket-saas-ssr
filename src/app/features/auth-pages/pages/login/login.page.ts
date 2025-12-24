import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthApiService, LoginData } from '../../data-access/auth-api.service';
import { AuthService, CurrentUser } from '../../../../core/auth/auth.service';

import { UiConfirmModalComponent, ConfirmStyle } from '../../../../shared/ui/ui-confirm-modal/ui-confirm-modal.component';
import { ButtonComponent } from '../../../../shared/ui/components/button/button.component';

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  icon: string;
  confirmText: string;
  cancelText: string;
  confirmStyle: ConfirmStyle;
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent, UiConfirmModalComponent],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private api = inject(AuthApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = false;

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  modal = signal<ModalState>({
    open: false,
    title: '',
    message: '',
    icon: '⚡',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    confirmStyle: 'primary',
  });

  private pendingLoginData: LoginData | null = null;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.errorMessage.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const body = this.loginForm.getRawValue() as { username: string; password: string };

    this.api.login(body).subscribe({
      next: (res) => {
        this.loading.set(false);

        // ✅ Map LoginData => CurrentUser
        const mappedUser = this.mapLoginDataToCurrentUser(res);

        const expiryDate = (res as any).expiryDate; // backend trả thêm
        if (!expiryDate) {
          this.auth.loginSuccess(res.token, res.refreshToken, mappedUser);
          this.router.navigateByUrl('/app');
          return;
        }

        const now = new Date();
        const exp = new Date(expiryDate);
        const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // ✅ expired => block login
        if (diffDays < 0) {
          this.pendingLoginData = res;
          this.openModal({
            title: 'License đã hết hạn',
            message: `License của bạn đã hết hạn từ ${exp.toLocaleDateString()}. Vui lòng mua thêm để tiếp tục sử dụng.`,
            icon: '⛔',
            confirmText: 'Mua license',
            cancelText: 'Đóng',
            confirmStyle: 'danger',
          });
          return;
        }

        // ✅ <= 7 days => warning modal
        if (diffDays <= 7) {
          this.pendingLoginData = res;
          this.openModal({
            title: 'Sắp hết hạn license',
            message: `License sẽ hết hạn sau ${diffDays} ngày (${exp.toLocaleDateString()}). Bạn có muốn mua thêm ngay không?`,
            icon: '⚠️',
            confirmText: 'Mua ngay',
            cancelText: 'Để sau',
            confirmStyle: 'warning',
          });
          return;
        }

        // ✅ normal login
        this.auth.loginSuccess(res.token, res.refreshToken, mappedUser);
        this.router.navigateByUrl('/app');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      },
    });
  }

  private mapLoginDataToCurrentUser(res: LoginData): CurrentUser {
    return {
      id: res.id ?? 0,
      username: res.userName ?? '',
      fullName: res.userName ?? '', // backend chưa có fullName thì dùng tạm userName
      roles: res.roles ?? [],
      email: res.emailFace ?? undefined,
      phone: undefined,
      avatarUrl: undefined,
    };
  }

  openModal(p: Partial<ModalState>) {
    this.modal.set({ ...this.modal(), open: true, ...p });
  }

  closeModal() {
    this.modal.set({ ...this.modal(), open: false });
  }

  onModalConfirm() {
    this.closeModal();
    this.router.navigateByUrl('/license/purchase');
    this.router.navigate(['/license/purchase']);

  }

  onModalCancel() {
    const m = this.modal();
    this.closeModal();

    // ✅ if warning only => allow login
    if (this.pendingLoginData && m.confirmStyle === 'warning') {
      const res = this.pendingLoginData;
      this.pendingLoginData = null;

      const mappedUser = this.mapLoginDataToCurrentUser(res);

      this.auth.loginSuccess(res.token, res.refreshToken, mappedUser);
      this.router.navigateByUrl('/app');
      return;
    }

    this.pendingLoginData = null;
  }
}
