import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage {
  saving = signal(false);
  message = signal<string | null>(null);

  user = computed(() => this.auth.currentUser());

  form = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true }),
    avatarUrl: new FormControl('', { nonNullable: true }),
  });

  constructor(private auth: AuthService) {
    const u = this.auth.currentUser();
    this.form.patchValue({
      fullName: u?.fullName ?? '',
      email: u?.email ?? '',
      phone: u?.phone ?? '',
      avatarUrl: u?.avatarUrl ?? '',
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.message.set('Vui lòng nhập Họ tên.');
      return;
    }

    this.saving.set(true);
    this.message.set(null);

    // ✅ tạm lưu local + update signal
    const v = this.form.getRawValue();
    this.auth.updateCurrentUser({
      fullName: v.fullName,
      email: v.email || undefined,
      phone: v.phone || undefined,
      avatarUrl: v.avatarUrl || undefined,
    });

    setTimeout(() => {
      this.saving.set(false);
      this.message.set('Đã lưu thông tin.');
    }, 250);
  }

  reset(): void {
    const u = this.auth.currentUser();
    this.form.reset({
      fullName: u?.fullName ?? '',
      email: u?.email ?? '',
      phone: u?.phone ?? '',
      avatarUrl: u?.avatarUrl ?? '',
    });
    this.message.set(null);
  }

  get initials(): string {
    const u = this.auth.currentUser();
    const name = (u?.fullName || u?.username || '').trim();
    if (!name) return 'U';
    const parts = name.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join('');
  }
}
