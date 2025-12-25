import { Routes } from '@angular/router';

export const LICENSE_ROUTES: Routes = [
  {
    path: 'purchase',
    loadComponent: () =>
      import('../license/page/purchase-license/purchase-license.component').then(m => m.PurchaseLicenseComponent),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('../license/page/history-user/license-history-user.component').then(m => m.LicenseHistoryUserComponent),
  },
];
