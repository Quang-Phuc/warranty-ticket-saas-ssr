// src/app/features/shell/layout/app-shell/app-shell.component.ts
import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';

export type NavItem = {
  id: string;
  label: string;
  icon?: string;
  route?: string | null;
  badge?: string | number;
  children?: NavItem[] | null;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

type ThemeMode = 'dark' | 'light';

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [CommonModule, RouterModule],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent implements OnInit {
  readonly theme = signal<ThemeMode>('dark');
  readonly collapsed = signal<boolean>(false);

  readonly navGroups = signal<NavGroup[]>([]);
  private readonly openMap = signal<Record<string, boolean>>({});

  constructor(
    private auth: AuthService,
    private router: Router,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  ngOnInit(): void {
    // collapsed state
    const c = localStorage.getItem('sidebarCollapsed');
    if (c === '1') this.collapsed.set(true);

    // theme
    const savedTheme = (localStorage.getItem('uiTheme') as ThemeMode | null) ?? null;
    if (savedTheme === 'dark' || savedTheme === 'light') this.theme.set(savedTheme);

    // menu
    const raw = localStorage.getItem('navGroups');
    if (raw) {
      try {
        this.navGroups.set(JSON.parse(raw) as NavGroup[]);
      } catch {
        this.navGroups.set(this.fallbackNav());
      }
    } else {
      this.navGroups.set(this.fallbackNav());
    }

  }

  // ===== Theme =====



  // ===== Sidebar =====
  toggleCollapsed(): void {
    const next = !this.collapsed();
    this.collapsed.set(next);
    localStorage.setItem('sidebarCollapsed', next ? '1' : '0');
  }

  // ===== Menu accordion =====
  isOpen(id: string): boolean {
    return !!this.openMap()[id];
  }

  toggleOpen(id: string): void {
    const curr = this.openMap();
    this.openMap.set({ ...curr, [id]: !curr[id] });
  }

  calcChildrenHeight(count: number): number {
    return Math.max(0, count) * 40 + 8;
  }

  /** ✅ handler click parent/menu item (fix lỗi parser) */
  onItemClick(ev: MouseEvent, item: NavItem): void {
    const hasChildren = (item.children?.length ?? 0) > 0;

    if (hasChildren) {
      // parent accordion -> không navigate
      ev.preventDefault();
      this.toggleOpen(item.id);
      return;
    }

    // leaf -> navigate nếu có route
    if (item.route) {
      // vẫn để routerLink tự xử lý cũng ok, nhưng giữ chắc:
      // this.router.navigateByUrl(item.route);
    }
  }

  logout(): void {
    this.auth.logout();
  }

  private fallbackNav(): NavGroup[] {
    return [
      {
        id: 'core',
        label: 'Tổng quan',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/app/dashboard' },
          {
            id: 'tickets',
            label: 'Tickets',
            icon: '🧾',
            route: null,
            children: [
              { id: 'tickets_list', label: 'Danh sách', route: '/app/tickets' },
              { id: 'tickets_new', label: 'Tạo mới', route: '/app/tickets/new' },
            ],
          },
        ],
      },
    ];
  }
}
