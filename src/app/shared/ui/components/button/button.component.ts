// src/app/shared/ui/components/button/button.component.ts
import { Component, Input, booleanAttribute } from '@angular/core';

@Component({
  selector: 'ui-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'ghost' = 'primary';
  @Input() disabled = false;
  @Input({ transform: booleanAttribute }) loading = false;

  // ✅ NEW: cho phép submit form
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
}
