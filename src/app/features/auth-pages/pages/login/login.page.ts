import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../../../core/auth/auth.service';
import { ButtonComponent } from '../../../../shared/ui/components/button/button.component';
import { AuthApiService } from '../../data-access/auth-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, RouterLink],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
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

    this.authApi.login({ username, password }).subscribe({
      next: (response) => {
        if (response.result === 'success' && response.data) {
          this.authService.loginSuccess(
            response.data.accessToken,
            response.data.refreshToken,
            response.data.user
          );
          this.router.navigateByUrl('/app');
        } else {
          this.errorMessage.set(response.message || 'Đăng nhập không thành công.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
        this.loading.set(false);
      }
    });
  }

  mockLogin() {
    this.authService.mockLogin();
    this.router.navigateByUrl('/app');
  }
}
