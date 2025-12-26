import { Component, Inject, signal, AfterViewInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UiDynamicFormComponent } from '../ui-dynamic-form/ui-dynamic-form.component';

@Component({
  selector: 'ui-form-modal',
  standalone: true,
  imports: [UiDynamicFormComponent],
  templateUrl: './ui-form-modal.component.html',
  styleUrl: './ui-form-modal.component.scss',
})
export class UiFormModalComponent implements AfterViewInit {
  draft = signal<Record<string, any>>({});
  valid = signal(true);

  @ViewChild(UiDynamicFormComponent) form!: UiDynamicFormComponent;

  constructor(
      @Inject(MAT_DIALOG_DATA) public data: any,
      private dialogRef: MatDialogRef<UiFormModalComponent>
  ) {
    this.draft.set({ ...(data.initModel || {}) });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const el = document.querySelector('.modal-body [data-required="1"]') as HTMLElement | null;
      el?.focus();
    }, 80);
  }

  close() {
    this.dialogRef.close(null);
  }

  submit() {
    this.form.markAllTouchedAndValidate();

    if (!this.valid()) {
      setTimeout(() => this.focusFirstError(), 50);
      return;
    }

    this.dialogRef.close(this.draft());
  }

  private focusFirstError() {
    const el = document.querySelector('.modal-body .ng-invalid[data-required="1"], .modal-body [data-required="1"].ng-invalid')as HTMLElement | null;

    // fallback: focus field có mat-error
    const fallback = document.querySelector('.modal-body mat-error')?.closest('.mat-mdc-form-field')
        ?.querySelector('input, textarea, mat-select') as HTMLElement | null;

    const target = el || fallback;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.focus();
    }
  }
}
