// src/app/features/auth-pages/pages/register/register.page.ts
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../shared/ui/components/button/button.component';

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
  // control ở đây là FormGroup, nhưng type là AbstractControl => cast an toàn
  const group = control as FormGroup;
  const p = group.get('password')?.value;
  const c = group.get('confirmPassword')?.value;
  return p === c ? null : { passwordMismatch: true };
};

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss'
})
export class RegisterPage {
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  showPassword = false;
  showConfirm = false;

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirm() { this.showConfirm = !this.showConfirm; }

  industries = [
    { value: 'phone-laptop', label: 'Điện thoại / Laptop' },
    { value: 'electronics', label: 'Điện máy / Điện tử' },
    { value: 'motorbike', label: 'Xe máy / Garage' },
    { value: 'appliance', label: 'Điện lạnh / Gia dụng' },
    { value: 'jewelry', label: 'Trang sức / Đồng hồ' },
    { value: 'other', label: 'Khác' },
  ];

  form = new FormGroup(
    {
      industry: new FormControl<string>('phone-laptop', {
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

  constructor(private router: Router) {}

  onSubmit() {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.form.invalid) {
      this.errorMessage.set('Vui lòng nhập đúng thông tin đăng ký.');
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    // TODO: gọi API register thật ở đây (authFacade.register)
    setTimeout(() => {
      this.loading.set(false);
      this.successMessage.set('Đăng ký thành công! Vui lòng đăng nhập.');
      this.router.navigateByUrl('/login');
    }, 600);
  }
}
