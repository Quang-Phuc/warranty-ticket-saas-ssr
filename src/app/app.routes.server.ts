import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Trang chủ: chỉ chạy trên client (CSR), KHÔNG SSR
  {
    path: '',
    renderMode: RenderMode.Server,   // ⬅️ đổi dòng này
  },
  // Khu admin: chỉ CSR
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  // Các route còn lại: SSR động (nếu cần)
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
