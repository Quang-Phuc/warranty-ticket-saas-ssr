// src/app/features/change-password/change-password.page.ts
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ApiClient } from '../../core/http/api-client';
import { Router } from '@angular/router';

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './change-password.page.html',
    styleUrls: ['./change-password.page.scss'], // ✅ FIX: styleUrls
})
export class ChangePasswordPage {
    saving = signal(false);
    message = signal<string | null>(null);

    form!: FormGroup;

    constructor(private fb: FormBuilder, private api: ApiClient, private router: Router) {
        // ✅ FIX: tạo form sau khi fb được inject
        this.form = this.fb.group({
            currentPassword: ['', [Validators.required, Validators.minLength(6)]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
        });
    }

    private focusFirstInvalid() {
        const keys = ['currentPassword', 'newPassword', 'confirmPassword'];

        for (const key of keys) {
            const ctrl = this.form.get(key);
            if (ctrl && ctrl.invalid) {
                const el = document.querySelector(`[formControlName="${key}"]`) as HTMLInputElement;
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.focus();
                }
                return;
            }
        }
    }

    save() {
        this.message.set(null);

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.focusFirstInvalid();
            this.message.set('❌ Vui lòng nhập đầy đủ thông tin.');
            return;
        }

        const { currentPassword, newPassword, confirmPassword } = this.form.getRawValue();

        if (newPassword !== confirmPassword) {
            this.form.get('confirmPassword')?.setErrors({ mismatch: true });
            this.focusFirstInvalid();
            this.message.set('❌ Mật khẩu xác nhận không khớp.');
            return;
        }

        this.saving.set(true);

        this.api.putData('me/change-password', { currentPassword, newPassword }).subscribe({
            next: () => {
                this.message.set('✅ Đổi mật khẩu thành công!');
                this.saving.set(false);
                setTimeout(() => this.router.navigateByUrl('/app/profile'), 800);
            },
            error: (err) => {
                this.message.set(err?.error?.message || '❌ Đổi mật khẩu thất bại.');
                this.saving.set(false);
            },
        });
    }

    back() {
        this.router.navigateByUrl('/app/profile');
    }
}
