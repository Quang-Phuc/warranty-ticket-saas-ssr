// src/app/features/auth/pages/login/login.page.ts
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../../../core/auth/auth.service';
import { ButtonComponent } from '../../../../shared/ui/components/button/button.component';
import { AuthApiService } from '../../data-access/auth-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, RouterLink],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  showPassword = false;
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor(
    private authService: AuthService,
    private authApi: AuthApiService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { username, password } = this.loginForm.getRawValue();

    this.authApi
      .login({ username, password })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response?.result === 'success' && response?.data) {
            this.authService.loginSuccess(
              response.data.accessToken,
              response.data.refreshToken,
              response.data.user
            );
            this.router.navigateByUrl('/app');
            return;
          }

          // Business error (API trả 200 nhưng result = error)
          this.errorMessage.set(response?.message || 'Đăng nhập không thành công.');
        },
        error: () => {
          // HTTP error đã được interceptor tự show toast rồi
          // Ở đây chỉ set message nếu bạn muốn hiện trên UI form
          this.errorMessage.set('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
        },
      });
  }

  mockLogin() {
    this.authService.mockLogin();
    this.router.navigateByUrl('/app');
  }
}
