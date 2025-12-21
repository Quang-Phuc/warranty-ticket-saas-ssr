import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { ButtonComponent } from '../../../../shared/ui/components/button/button.component';

@Component({
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  constructor(private auth: AuthService, private router: Router) {}

  login(): void {
    this.auth.mockLogin();
    this.router.navigateByUrl('/app');
  }
}
