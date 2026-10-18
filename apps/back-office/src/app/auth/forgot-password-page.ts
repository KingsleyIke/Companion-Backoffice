import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { adminForgotPassword, Api } from '@companion/contracts';

import { authErrorMessage } from './auth-error';

@Component({
  selector: 'app-forgot-password-page',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './forgot-password-page.html',
  styleUrl: './auth-page.scss',
})
export class ForgotPasswordPage {
  private readonly api = inject(Api);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  protected readonly sent = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  // The API answers the same whether or not the email belongs to an admin, and so does this page.
  protected async send(): Promise<void> {
    if (this.form.invalid) {
      this.error.set('Enter the email address you sign in with.');
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.api.invoke(adminForgotPassword, { body: this.form.getRawValue() });
      this.sent.set(true);
    } catch (error) {
      this.error.set(authErrorMessage(error, 'Could not send the link. Try again.'));
    } finally {
      this.busy.set(false);
    }
  }
}
