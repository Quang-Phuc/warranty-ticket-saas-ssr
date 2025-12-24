import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type ConfirmStyle = 'primary' | 'danger' | 'success' | 'warning';

@Component({
  selector: 'ui-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-confirm-modal.component.html',
  styleUrls: ['./ui-confirm-modal.component.scss'],
})
export class UiConfirmModalComponent {
  @Input() open = false;
  @Input() title = 'Xác nhận';
  @Input() message = '';
  @Input() icon = '⚡';
  @Input() confirmText = 'Xác nhận';
  @Input() cancelText = 'Hủy';
  @Input() confirmStyle: ConfirmStyle = 'primary';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onBackdropClick() {
    this.onCancel();
  }

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
