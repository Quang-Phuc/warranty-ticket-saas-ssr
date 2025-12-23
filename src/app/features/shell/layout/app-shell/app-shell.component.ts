// src/app/features/shell/layout/app-shell/app-shell.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { ButtonComponent } from '../../../../shared/ui/components/button/button.component';

type ThemeMode = 'light' | 'dark';

export type NavItem = {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  children?: NavItem[];
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ButtonComponent],
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
    const saved = (localStorage.getItem('ui.theme') as ThemeMode) || 'light';
    this.setTheme(saved);
  }

  toggleTheme() {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private setTheme(mode: ThemeMode) {
    this.theme.set(mode);
    localStorage.setItem('ui.theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
  }

  private loadMenuFromStorage() {
    const raw = this.safeParse(localStorage.getItem('navGroups'));
    this.navGroups.set(Array.isArray(raw) ? raw : []);
    this.seedExpanded(this.navGroups());
  }

  private safeParse(v: string | null) {
    try {
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  }

  private seedExpanded(groups: NavGroup[]) {
    const state: Record<string, boolean> = {};
    for (const g of groups) {
      for (const it of g.items) {
        if (it.children?.length) state[it.id] = true; // default open
      }
    }
    this.expanded.set(state);
  }

  isOpen(id: string) {
    return !!this.expanded()[id];
  }

  toggleOpen(id: string) {
    this.expanded.set({ ...this.expanded(), [id]: !this.expanded()[id] });
  }

  logout(): void {
    this.auth.logout();
  }
}
