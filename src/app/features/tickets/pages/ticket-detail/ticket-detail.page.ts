import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TicketStatusBadgeComponent } from '../../ui/ticket-status-badge/ticket-status-badge.component';

@Component({
  standalone: true,
  imports: [RouterLink, TicketStatusBadgeComponent],
  templateUrl: './ticket-detail.page.html',
  styleUrl: './ticket-detail.page.scss'
})
export class TicketDetailPage {
  id = '';
  status: any = 'RECEIVED';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
  }
}
