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

  errors = signal<Record<string, string>>({});

  visibleFields = computed(() =>
    this.fields().filter(f => (f.visible ? f.visible(this.model()) : true))
  );

  patch(key: string, val: any) {
    const next = { ...this.model(), [key]: val };
    this.modelChange.emit(next);
    this.validateAll(next);
  }

  validateAll(m: any) {
    const errs: Record<string, string> = {};

    for (const f of this.visibleFields()) {
      const v = m?.[`${f.key}`];

      if (f.required && (v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0))) {
        errs[`${f.key}`] = 'Trường này bắt buộc';
        continue;
      }

      if (f.validator) {
        const msg = f.validator(v, m);
        if (msg) errs[`${f.key}`] = msg;
      }
    }

    this.errors.set(errs);
    this.validChange.emit(Object.keys(errs).length === 0);
  }

  errorOf(key: any) {
    return this.errors()[`${key}`];
  }
}
