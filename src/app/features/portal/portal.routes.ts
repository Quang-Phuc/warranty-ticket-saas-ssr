import { Routes } from '@angular/router';

export const PORTAL_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'lookup' },
  { path: 'lookup', loadComponent: () => import('./pages/warranty-lookup/warranty-lookup.page').then(m => m.WarrantyLookupPage) }
];
