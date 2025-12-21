import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TicketStatusBadgeComponent } from '../../ui/ticket-status-badge/ticket-status-badge.component';

@Component({
  standalone: true,
  imports: [RouterLink, TicketStatusBadgeComponent],
  templateUrl: './ticket-list.page.html',
  styleUrl: './ticket-list.page.scss'
})
export class TicketListPage {
  // Demo data
  tickets = [
    { id: 'T-1001', title: 'iPhone 12 - không lên nguồn', status: 'RECEIVED', createdAt: new Date().toISOString() },
    { id: 'T-1002', title: 'Máy giặt - kêu to', status: 'CHECKING', createdAt: new Date().toISOString() }
  ] as const;
}
