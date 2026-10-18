import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthSession } from '../auth/auth-session';
import { PageTitle } from './page-title';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly session = inject(AuthSession);
  private readonly router = inject(Router);

  protected readonly title = inject(PageTitle).current;
  protected readonly admin = this.session.admin;
  protected readonly initials = computed(() =>
    (this.admin()?.name ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join(''),
  );

  protected async signOut(): Promise<void> {
    try {
      await this.session.signOut();
    } finally {
      await this.router.navigate(['/login']);
    }
  }
}
