import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'ghost' = 'primary';
  @Input() disabled = false;
}
