import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { ButtonComponent } from '../../../../shared/ui/components/button/button.component';

@Component({
  standalone: true,
  imports: [RouterOutlet, RouterLink, ButtonComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent {
  constructor(private auth: AuthService) {}

  logout(): void {
    this.auth.logout();
    location.href = '/login';
  }
}
