import { Routes } from '@angular/router';

export const WARRANTIES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/warranty-list/warranty-list.page').then(m => m.WarrantyListPage) }
];
