// src/app/features/shell/layout/app-shell/app-shell.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

type ThemeMode = 'light' | 'dark';

export type NavItem = {
  id: string;
  label: string;
  icon?: string;
  route?: string | null;
  children?: NavItem[] | null;
  badge?: number;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent implements OnInit {
  theme = signal<ThemeMode>('light');
  navGroups = signal<NavGroup[]>([]);
  expanded = signal<Record<string, boolean>>({});

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.initTheme();
    this.loadMenuFromStorage();
  }

  private initTheme() {
    // ưu tiên theme từ login (localStorage ui.theme), fallback light
    const saved = (localStorage.getItem('ui.theme') as ThemeMode) || 'light';
    this.setTheme(saved);
  }

  toggleTheme() {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private setTheme(mode: ThemeMode) {
    this.theme.set(mode);
    localStorage.setItem('ui.theme', mode);

    // set vào host
    (document.querySelector('app-root') || document.documentElement).setAttribute('data-theme', mode);
  }

  private loadMenuFromStorage() {
    const raw = this.safeParse(localStorage.getItem('navGroups'));
    const groups: NavGroup[] = Array.isArray(raw) ? this.normalizeGroups(raw as NavGroup[]) : [];
    this.navGroups.set(groups);

    // auto open các menu có children
    const state: Record<string, boolean> = {};
    for (const g of groups) {
      for (const it of g.items) {
        if (it.children && it.children.length) state[it.id] = true;
      }
    }
    this.expanded.set(state);
  }

  private normalizeGroups(groups: NavGroup[]): NavGroup[] {
    // API bạn trả: children: null -> convert sang []
    return (groups || []).map((g) => ({
      ...g,
      items: (g.items || []).map((it) => ({
        ...it,
        children: Array.isArray(it.children) ? it.children : [],
      })),
    }));
  }

  private safeParse(v: string | null) {
    try {
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  }

  isOpen(id: string) {
    return !!this.expanded()[id];
  }

  toggleOpen(id: string) {
    this.expanded.set({ ...this.expanded(), [id]: !this.expanded()[id] });
  }

  calcChildrenHeight(count: number) {
    return Math.min(420, count * 52 + 12);
  }

  logout(): void {
    this.auth.logout();
  }
}
