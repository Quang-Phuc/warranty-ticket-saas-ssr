import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject, OnInit, signal } from '@angular/core';
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

  // ✅ avatar dropdown
  readonly userMenuOpen = signal(false);

  constructor(
    public auth: AuthService,
    private router: Router,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  ngOnInit(): void {
    const c = localStorage.getItem('sidebarCollapsed');
    if (c === '1') this.collapsed.set(true);

    const savedTheme = (localStorage.getItem('uiTheme') as ThemeMode | null) ?? null;
    if (savedTheme === 'dark' || savedTheme === 'light') this.theme.set(savedTheme);

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

    this.applyTheme(this.theme());
  }

  // ===== Theme =====
  toggleTheme(): void {
    const next: ThemeMode = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    localStorage.setItem('uiTheme', next);
    this.applyTheme(next);
  }

  private applyTheme(mode: ThemeMode): void {
    const root = this.doc.documentElement;
    root.setAttribute('data-theme', mode);

    const vars =
      mode === 'dark'
        ? {
          '--app-bg': '#0b1220',
          '--app-bg2': '#0a0f1a',
          '--app-surface': 'rgba(255,255,255,0.08)',
          '--app-surface2': 'rgba(255,255,255,0.06)',
          '--app-stroke': 'rgba(255,255,255,0.12)',
          '--app-text': 'rgba(255,255,255,0.92)',
          '--app-muted': 'rgba(255,255,255,0.62)',
          '--app-primary': '#7c3aed',
          '--app-primary2': '#22c55e',
        }
        : {
          '--app-bg': '#f7f8fc',
          '--app-bg2': '#ffffff',
          '--app-surface': 'rgba(15,23,42,0.05)',
          '--app-surface2': 'rgba(15,23,42,0.035)',
          '--app-stroke': 'rgba(15,23,42,0.10)',
          '--app-text': '#0f172a',
          '--app-muted': 'rgba(15,23,42,0.62)',
          '--app-primary': '#6d28d9',
          '--app-primary2': '#16a34a',
        };

    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }

  // ===== Sidebar =====
  toggleCollapsed(): void {
    const next = !this.collapsed();
    this.collapsed.set(next);
    localStorage.setItem('sidebarCollapsed', next ? '1' : '0');

    // khi collapsed thì đóng dropdown cho gọn
    if (next) this.userMenuOpen.set(false);
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

  onItemClick(ev: MouseEvent, item: NavItem): void {
    const hasChildren = (item.children?.length ?? 0) > 0;
    if (hasChildren) {
      ev.preventDefault();
      this.toggleOpen(item.id);
    }
  }

  // ===== Avatar menu =====
  toggleUserMenu(): void {
    this.userMenuOpen.set(!this.userMenuOpen());
  }

  goProfile(): void {
    this.userMenuOpen.set(false);
    this.router.navigateByUrl('/app/profile');
  }
  goChangePassword() {
    this.router.navigateByUrl('/app/change-password');
    this.userMenuOpen.set(false);
  }


  logout(): void {
    this.userMenuOpen.set(false);
    this.auth.logout();
  }

  get initials(): string {
    const u = this.auth.currentUser();
    const name = (u?.fullName || u?.username || '').trim();
    if (!name) return 'U';
    const parts = name.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join('');
  }

  // click ngoài -> đóng dropdown
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    const t = ev.target as HTMLElement | null;
    if (!t) return;
    if (t.closest('.userbox')) return;
    if (this.userMenuOpen()) this.userMenuOpen.set(false);
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
