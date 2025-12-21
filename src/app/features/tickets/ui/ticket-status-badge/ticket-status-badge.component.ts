import { Component, Input } from '@angular/core';
import { TicketStatus } from '../../domain/ticket.models';

@Component({
  selector: 'ticket-status-badge',
  standalone: true,
  templateUrl: './ticket-status-badge.component.html',
  styleUrl: './ticket-status-badge.component.scss'
})
export class TicketStatusBadgeComponent {
  @Input({ required: true }) status!: TicketStatus;
}
