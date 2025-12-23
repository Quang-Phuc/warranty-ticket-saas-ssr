// src/app/features/auth/pages/register/register.page.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ButtonComponent } from '../../../../shared/ui/components/button/button.component';
import { AuthApiService } from '../../data-access/auth-api.service';

type IndustryOption = { value: string; label: string };

const vnPhoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const v = (control.value ?? '').toString().trim().replace(/\s/g, '');
  const ok = /^0\d{9}$/.test(v) || /^\+84\d{9,10}$/.test(v);
  return ok ? null : { phone: true };
};

const passwordStrengthValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const v = (control.value ?? '').toString();
  return v.length >= 6 ? null : { weak: true };
};

const matchPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const group = control as FormGroup;
  const p = group.get('password')?.value;
  const c = group.get('confirmPassword')?.value;
  return p === c ? null : { passwordMismatch: true };
};

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage implements OnInit {
  loading = signal(false);
  loadingIndustries = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  showPassword = false;
  showConfirm = false;

  industries = signal<IndustryOption[]>([{ value: 'other', label: 'Khác' }]);

  form = new FormGroup(
    {
      industryId: new FormControl<string>('other', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      phone: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, vnPhoneValidator],
      }),
      password: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, passwordStrengthValidator],
      }),
      confirmPassword: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: [matchPasswordValidator] }
  );

  constructor(private router: Router, private authApi: AuthApiService) {}

  ngOnInit(): void {
    this.loadIndustries();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
  }

  private loadIndustries() {
    this.loadingIndustries.set(true);

    // ✅ Nếu bạn đã chuyển ApiClient sang getData() => industries() trả IndustryDto[]
    // thì res ở đây là list luôn, không còn res.data nữa.
    this.authApi
      .industries()
      .pipe(finalize(() => this.loadingIndustries.set(false)))
      .subscribe({
        next: (list) => {
          const mapped = (list ?? []).map((x) => ({
            value: String(x.id),
            label: x.name,
          }));

          if (mapped.length) {
            this.industries.set(mapped);
            this.form.get('industryId')?.setValue(mapped[0].value);
          }
        },
        error: () => {
          // HTTP error đã auto toast (interceptor). Ở đây giữ fallback, không crash.
        },
      });
  }

  onSubmit() {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.form.invalid) {
      this.errorMessage.set('Vui lòng nhập đúng thông tin đăng ký.');
      this.form.markAllAsTouched();
      return;
    }

    const { industryId, phone, password } = this.form.getRawValue();

    const payload = {
      industryId,
      phone,
      password,
    };

    this.loading.set(true);

    // ✅ Nếu bạn đã chuyển ApiClient sang postData() => register() có thể trả any (data)
    // Nhiều API register thường không cần data, chỉ cần success là navigate.
    this.authApi
      .register(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          // success auto (ApiClient unwrap) => tới đây là OK
          this.successMessage.set('Đăng ký thành công! Vui lòng đăng nhập.');
          this.router.navigateByUrl('/login');
        },
        error: () => {
          // toast đã auto rồi, nếu muốn hiện dưới form thì bật dòng dưới:
          // this.errorMessage.set('Đăng ký thất bại. Vui lòng thử lại.');
        },
      });
  }
}
