import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { FieldConfig } from './ui-dynamic-form.types';
import { UiUploadFieldComponent } from '../ui-upload-field/ui-upload-field.component';

@Component({
  selector: 'ui-dynamic-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    UiUploadFieldComponent,
  ],
  templateUrl: './ui-dynamic-form.component.html',
  styleUrl: './ui-dynamic-form.component.scss',
})
export class UiDynamicFormComponent<T = any> {
  fields = input<FieldConfig<T>[]>([]);
  model = input<Record<string, any>>({});
  readonly = input<boolean>(false);

  modelChange = output<Record<string, any>>();
  validChange = output<boolean>();
  errorFocus = output<string>();

  touched = signal(false);
  errors = signal<Record<string, string>>({});

  visibleFields = computed(() =>
      this.fields().filter(f => (f.visible ? f.visible(this.model()) : true))
  );

  /** ✅ convert any key to string (avoid symbol error) */
  keyStr(key: any): string {
    return String(key);
  }

  patch(key: any, val: any) {
    const k = this.keyStr(key);
    const field = this.fields().find(x => this.keyStr(x.key) === k);

    // ✅ nếu là select thì normalize kiểu dữ liệu
    if (field?.type === 'select' && field.options?.length) {
      const matched = field.options.find(o => String(o.value) === String(val));
      val = matched ? matched.value : null;
    }

    const next = { ...this.model(), [k]: val };
    this.modelChange.emit(next);
    this.validateAll(next);
  }


  validateAll(m: any) {
    const errs: Record<string, string> = {};

    for (const f of this.visibleFields()) {
      const k = this.keyStr(f.key);
      const v = m?.[k];

      if (f.required) {
        const empty =
            v === null || v === undefined || v === '' ||
            (Array.isArray(v) && v.length === 0);
        if (empty) errs[k] = 'Trường này bắt buộc';
      }

      if (f.validator) {
        const msg = f.validator(v, m);
        if (msg) errs[k] = msg;
      }
    }

    this.errors.set(errs);
    const ok = Object.keys(errs).length === 0;
    this.validChange.emit(ok);

    // ✅ emit field lỗi đầu tiên để focus
    if (!ok) {
      const firstKey = Object.keys(errs)[0];
      this.errorFocus.emit(firstKey);
    }
  }


  getValue(key: any) {
    return this.model()[this.keyStr(key)];
  }
  sortedVisibleFields = computed(() => {
    const list = this.visibleFields();
    const uploadTypes = new Set(['image', 'images', 'file', 'files']);
    return [...list].sort((a, b) => {
      const au = uploadTypes.has(a.type);
      const bu = uploadTypes.has(b.type);
      return Number(au) - Number(bu); // upload xuống cuối
    });
  });

  /** ✅ gọi khi bấm submit */
  markAllTouchedAndValidate() {
    this.touched.set(true);
    this.validateAll(this.model());
  }

  errorOf(key: any) {
    const k = this.keyStr(key);
    return this.touched() ? this.errors()[k] : null;
  }
  formatMoney(v: any): string {
    if (v === null || v === undefined || v === '') return '';
    const num = Number(String(v).replace(/[^\d]/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString('vi-VN');
  }

  parseMoney(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const num = Number(String(v).replace(/[^\d]/g, ''));
    return isNaN(num) ? null : num;
  }

  onMoneyChange(key: any, raw: string) {
    const k = this.keyStr(key);
    const num = this.parseMoney(raw);

    // ✅ lưu xuống model là NUMBER không có dấu
    this.patch(k, num);
  }

}
