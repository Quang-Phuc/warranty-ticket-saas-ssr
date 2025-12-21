import { Routes } from '@angular/router';

export const ASSETS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/asset-list/asset-list.page').then(m => m.AssetListPage) }
];
