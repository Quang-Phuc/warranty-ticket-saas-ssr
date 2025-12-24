import { Routes } from '@angular/router';

export const LICENSE_ROUTES: Routes = [
  {
    path: 'purchase',
    loadComponent: () =>
      import('../license/page/purchase-license/purchase-license.component').then(m => m.PurchaseLicenseComponent),
  },
  // nếu có lịch sử mua
  // {
  //   path: 'history',
  //   loadComponent: () =>
  //     import('./pages/license-history/license-history.page').then(m => m.LicenseHistoryPage),
  // },
];
