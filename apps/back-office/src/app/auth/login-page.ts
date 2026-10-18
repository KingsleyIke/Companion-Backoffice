import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';

import { authErrorMessage } from './auth-error';
import { AuthSession } from './auth-session';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './login-page.html',
  styleUrl: './auth-page.scss',
})
export class LoginPage {
  private readonly session = inject(AuthSession);
  private readonly router = inject(Router);

  // Router input binding sets an absent query parameter to undefined, overriding a plain default.
  readonly returnUrl = input('/', { transform: (url: string | undefined) => url || '/' });

  protected readonly credentials = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected readonly codeForm = inject(FormBuilder).nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  protected readonly mfaToken = signal<string | null>(null);
  protected readonly showPassword = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected async signIn(): Promise<void> {
    if (this.credentials.invalid) {
      this.error.set('Please enter your email and password.');
      return;
    }
    const { email, password } = this.credentials.getRawValue();
    await this.attempt(async () => {
      const step = await this.session.signIn(email, password);
      if (step.kind === 'mfa-required') {
        this.mfaToken.set(step.mfaToken);
      } else {
        await this.router.navigateByUrl(this.returnUrl());
      }
    }, 'Could not sign in. Try again.');
  }

  protected async verifyCode(): Promise<void> {
    const mfaToken = this.mfaToken();
    if (!mfaToken || this.codeForm.invalid) {
      this.error.set('Enter the six-digit code from your authenticator app.');
      return;
    }
    await this.attempt(async () => {
      await this.session.completeMfa(mfaToken, this.codeForm.getRawValue().code);
      await this.router.navigateByUrl(this.returnUrl());
    }, 'Could not verify the code. Try again.');
  }

  protected startOver(): void {
    this.mfaToken.set(null);
    this.codeForm.reset();
    this.error.set(null);
  }

  private async attempt(action: () => Promise<void>, fallback: string): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      await action();
    } catch (error) {
      this.error.set(authErrorMessage(error, fallback));
    } finally {
      this.busy.set(false);
    }
  }
}
