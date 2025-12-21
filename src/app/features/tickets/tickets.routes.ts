import { Routes } from '@angular/router';

export const TICKETS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/ticket-list/ticket-list.page').then(m => m.TicketListPage) },
  { path: 'new', loadComponent: () => import('./pages/ticket-create/ticket-create.page').then(m => m.TicketCreatePage) },
  { path: ':id', loadComponent: () => import('./pages/ticket-detail/ticket-detail.page').then(m => m.TicketDetailPage) }
];
