// src/app/features/auth/pages/login/login.page.ts
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { AuthService, CurrentUser } from '../../../../core/auth/auth.service';
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

  private toCurrentUser(data: any): CurrentUser {
    // Backend JwtResponse: id, userName, roles, ... (fullName chưa có)
    // => map hợp lệ cho CurrentUser của FE
    const username = (data?.userName ?? data?.username ?? '').toString();
    const id = Number(data?.id ?? 0) || 0;
    const roles = Array.isArray(data?.roles) ? data.roles : [];

    return {
      id,
      username: username || 'unknown',
      // chưa có fullName từ backend => dùng username tạm
      fullName: (data?.fullName ?? username ?? 'User').toString(),
      roles,
    };
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { username, password } = this.loginForm.getRawValue();
    const payload = { username, password };

    this.authApi
      .login(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          // ✅ LƯU MENU + THEME TỪ API LOGIN
          localStorage.setItem('navGroups', JSON.stringify(data.navGroups ?? []));
          localStorage.setItem('ui.theme', data.ui?.theme ?? 'light');

          // ✅ Map về CurrentUser đúng kiểu FE
          const currentUser = this.toCurrentUser(data);

          // ✅ Lưu token + user
          this.authService.loginSuccess(
            data.token,
            data.refreshToken ?? '',
            currentUser
          );

          this.router.navigateByUrl('/app');
        },
        error: () => {
          // HTTP error đã interceptor toast rồi, nếu muốn show text dưới form:
          this.errorMessage.set('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
        },
      });
  }

  mockLogin() {
    this.authService.mockLogin();
    this.router.navigateByUrl('/app');
  }
}
