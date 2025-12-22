import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
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
import { AuthApiService } from '../../data-access/auth-api.service';
import { IndustriesService, IndustryOption } from '../../data-access/industries.service';

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
  styleUrl: './register.page.scss'
})
export class RegisterPage implements OnInit {
  loading = signal(false);
  loadingIndustries = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  showPassword = false;
  showConfirm = false;

  industries = signal<IndustryOption[]>([
    // fallback tạm cho khỏi trống lúc load fail
    { value: 'other', label: 'Khác' }
  ]);

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

  constructor(
    private router: Router,
    private industriesService: IndustriesService,
    private authApi: AuthApiService
  ) {}

  ngOnInit(): void {
    this.loadIndustries();
  }

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirm() { this.showConfirm = !this.showConfirm; }

  private loadIndustries() {
    this.loadingIndustries.set(true);
    this.industriesService.getIndustries().subscribe({
      next: (list) => {
        if (list?.length) {
          this.industries.set(list);
          // set default = item đầu
          this.form.get('industryId')?.setValue(list[0].value);
        }
        this.loadingIndustries.set(false);
      },
      error: () => {
        this.loadingIndustries.set(false);
        // giữ fallback, không crash
      }
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

    this.loading.set(true);

    const payload = {
      industryId: this.form.value.industryId!,
      phone: this.form.value.phone!,
      password: this.form.value.password!,
    };

    this.authApi.register(payload).subscribe({
      next: (res) => {
        // tuỳ backend: nếu res.result==='success' ...
        this.loading.set(false);
        this.successMessage.set('Đăng ký thành công! Vui lòng đăng nhập.');
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    });
  }
}
