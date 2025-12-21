// src/app/features/auth-pages/pages/login/login.page.ts
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthFacade } from '../../data-access';
import { ButtonComponent } from '../../../../shared/ui/components/button/button.component';
import {CommonModule} from '@angular/common';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    // InputComponent nếu có
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    private authService: AuthService,
    private authFacade: AuthFacade,
    private router: Router
  ) {}

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { username, password } = this.loginForm.value;

    this.authFacade.login({ username: username!, password: password! }).subscribe({
      next: (response) => {
        if (response.result === 'success' && response.data) {
          const loginData = response.data;
          this.authService.loginSuccess(
            loginData.accessToken,
            loginData.refreshToken,
            loginData.user
          );
          this.router.navigateByUrl('/app');
        } else {
          this.errorMessage.set(response.message || 'Đăng nhập thất bại.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Lỗi kết nối server.');
        this.loading.set(false);
      }
    });
  }

  // Giữ lại để demo nhanh nếu cần
  mockLogin() {
    this.authService.mockLogin();
    this.router.navigateByUrl('/app');
  }
}
