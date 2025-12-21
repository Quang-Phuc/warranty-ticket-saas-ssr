import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'app'
  },
  {
    path: 'login',
    loadChildren: () => import('./features/auth-pages/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'portal',
    loadChildren: () => import('./features/portal/portal.routes').then(m => m.PORTAL_ROUTES)
  },
  {
    path: 'app',
    loadChildren: () => import('./features/shell/shell.routes').then(m => m.SHELL_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'app'
  }
];
