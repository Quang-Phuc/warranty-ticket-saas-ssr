// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomePage } from './features/home/pages/home.page';

export const routes: Routes = [
  // Home: /
  {
    path: '',
    pathMatch: 'full',
    component: HomePage
  },

  // Auth: /login, /register, /forgot-password...
  {
    path: '',
    loadChildren: () =>
      import('./features/auth-pages/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // Portal
  {
    path: 'portal',
    loadChildren: () =>
      import('./features/portal/portal.routes').then((m) => m.PORTAL_ROUTES),
  },

  // App shell
  {
    path: 'app',
    loadChildren: () =>
      import('./features/shell/shell.routes').then((m) => m.SHELL_ROUTES),
  },

  // Wildcard
  {
    path: '**',
    redirectTo: ''
  }
];
