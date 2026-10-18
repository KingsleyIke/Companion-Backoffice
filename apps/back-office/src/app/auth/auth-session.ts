import { computed, inject, Injectable, signal } from '@angular/core';
import {
  adminLogin,
  adminLoginMfa,
  adminLogout,
  adminRefresh,
  Api,
  type AuthSessionDto,
} from '@companion/contracts';

// What a sign-in attempt needs next: nothing, or a TOTP code (super admins).
export type SignInStep = { kind: 'signed-in' } | { kind: 'mfa-required'; mfaToken: string };

const CSRF = { 'X-Requested-With': 'XMLHttpRequest' } as const;

// The signed-in admin and their access token, held in memory only: never in localStorage, so a
// script injected into the page cannot read it later. The refresh token lives in an httpOnly
// cookie the browser sends to the auth endpoints by itself.
@Injectable({ providedIn: 'root' })
export class AuthSession {
  private readonly api = inject(Api);
  private readonly session = signal<AuthSessionDto | null>(null);
  private refreshing: Promise<boolean> | null = null;

  readonly admin = computed(() => this.session()?.admin ?? null);
  readonly isSignedIn = computed(() => this.session() !== null);
  readonly accessToken = computed(() => this.session()?.accessToken ?? null);

  async signIn(email: string, password: string): Promise<SignInStep> {
    const result = await this.api.invoke(adminLogin, { body: { email, password } });
    if (result.session) {
      this.session.set(result.session);
      return { kind: 'signed-in' };
    }
    return { kind: 'mfa-required', mfaToken: result.mfaToken ?? '' };
  }

  async completeMfa(mfaToken: string, code: string): Promise<void> {
    this.session.set(await this.api.invoke(adminLoginMfa, { body: { mfaToken, code } }));
  }

  // Single-flight: callers racing on an expired token share one request, so the API never sees
  // the same refresh token twice (it would treat the second as reuse).
  refresh(): Promise<boolean> {
    this.refreshing ??= this.api
      .invoke(adminRefresh, CSRF)
      .then(
        (session) => {
          this.session.set(session);
          return true;
        },
        () => {
          this.session.set(null);
          return false;
        },
      )
      .finally(() => (this.refreshing = null));
    return this.refreshing;
  }

  async signOut(): Promise<void> {
    try {
      await this.api.invoke(adminLogout, CSRF);
    } finally {
      this.session.set(null);
    }
  }
}
