import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';

export const SHELL_ROUTES: Routes = [
  {
    path: '',
    canMatch: [authGuard],
    loadComponent: () => import('./layout/app-shell/app-shell.component').then(m => m.AppShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

      { path: 'dashboard', loadChildren: () => import('../dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES) },
      { path: 'tickets', loadChildren: () => import('../tickets/tickets.routes').then(m => m.TICKETS_ROUTES) },
      { path: 'customers', loadChildren: () => import('../customers/customers.routes').then(m => m.CUSTOMERS_ROUTES) },
      { path: 'assets', loadChildren: () => import('../assets/assets.routes').then(m => m.ASSETS_ROUTES) },
      { path: 'warranties', loadChildren: () => import('../warranties/warranties.routes').then(m => m.WARRANTIES_ROUTES) },
      { path: 'settings', loadChildren: () => import('../settings/settings.routes').then(m => m.SETTINGS_ROUTES) },

      // ✅ NEW
      { path: 'profile', loadComponent: () => import('../profile/profile.page').then(m => m.ProfilePage) },
    ],
  },
];
