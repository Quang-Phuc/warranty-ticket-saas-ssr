import { Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

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
  imports: [CommonModule, MatDialogModule, MatButtonModule, UiDynamicFormComponent],
  templateUrl: './ui-form-modal.component.html',
  styleUrl: './ui-form-modal.component.scss',
})
export class UiFormModalComponent {
  draft = signal<Record<string, any>>({});
  valid = signal(true);

  constructor(
      @Inject(MAT_DIALOG_DATA) public data: UiFormModalData,
      private dialogRef: MatDialogRef<UiFormModalComponent>
  ) {
    this.draft.set({ ...(data.initModel || {}) });
  }

  close() {
    this.dialogRef.close(null);
  }

  submit() {
    if (!this.valid()) return;
    this.dialogRef.close(this.draft());
  }
}
