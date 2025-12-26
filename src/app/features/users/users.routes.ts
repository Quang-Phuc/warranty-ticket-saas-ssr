import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
    {
        path: 'list',
        loadComponent: () =>
            import('./page/user-management/user-management.component').then(
                (m) => m.UserManagementComponent
            ),
        title: 'Quản lý user',
    },

    // Sau này thêm detail:
    // {
    //   path: 'detail/:id',
    //   loadComponent: () =>
    //     import('./page/user-detail/user-detail.component').then(
    //       (m) => m.UserDetailComponent
    //     ),
    //   title: 'Chi tiết user',
    // },

    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
    },
];
