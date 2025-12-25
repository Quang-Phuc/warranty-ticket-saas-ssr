import { Routes } from '@angular/router';

export const STORE_ROUTES: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('../store/page/store-management/store-management.component').then(
        m => m.StoreManagementComponent
      ),
    title: 'Quản lý cửa hàng',
  },
  // Bạn có thể thêm các route con khác sau này, ví dụ:
  // {
  //   path: 'detail/:id',
  //   loadComponent: () =>
  //     import('../store/page/store-detail/store-detail.component').then(
  //       m => m.StoreDetailComponent
  //     ),
  //   title: 'Chi tiết cửa hàng',
  // },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];
