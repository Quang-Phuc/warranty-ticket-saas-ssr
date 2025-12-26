import { Component, Inject, signal, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

import { UiDynamicFormComponent } from '../ui-dynamic-form/ui-dynamic-form.component';
import { FieldConfig } from '../ui-dynamic-form/ui-dynamic-form.types';

export interface UiFormModalData {
  title: string;
  fields: FieldConfig[];
  initModel?: Record<string, any>;
}

@Component({
  selector: 'ui-form-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, UiDynamicFormComponent],
  templateUrl: './ui-form-modal.component.html',
  styleUrl: './ui-form-modal.component.scss',
})
export class UiFormModalComponent implements AfterViewInit {
  draft = signal<Record<string, any>>({});
  valid = signal(true);

  constructor(
      @Inject(MAT_DIALOG_DATA) public data: UiFormModalData,
      private dialogRef: MatDialogRef<UiFormModalComponent>
  ) {
    this.draft.set({ ...(data.initModel || {}) });
  }

  /** ✅ Auto focus vào field required đầu tiên */
  ngAfterViewInit() {
    setTimeout(() => {
      // tìm field đầu tiên có data-required="1"
      const el = document.querySelector('.modal-body [data-required="1"]') as HTMLElement | null;
      el?.focus();
    }, 80);
  }

  close() {
    this.dialogRef.close(null);
  }

  submit() {
    if (!this.valid()) return;
    this.dialogRef.close(this.draft());
  }
}
