import { Routes } from '@angular/router';
import { HomePage } from './features/home/pages/home.page'; // Điều chỉnh path nếu folder khác

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomePage  // Trực tiếp load HomePage khi vào root
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
    redirectTo: ''  // Wildcard redirect về home nếu path không khớp
  }
];