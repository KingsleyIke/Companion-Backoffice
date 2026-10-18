import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { adminResetPassword, Api } from '@companion/contracts';

import { authErrorMessage } from './auth-error';

// Mirrors the API's rule (libs/dto PASSWORD_MIN_LENGTH); the API remains the authority.
const PASSWORD_MIN_LENGTH = 12;

@Component({
  selector: 'app-reset-password-page',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './reset-password-page.html',
  styleUrl: './auth-page.scss',
})
export class ResetPasswordPage {
  private readonly api = inject(Api);

  readonly token = input<string>('');

  protected readonly minLength = PASSWORD_MIN_LENGTH;
  protected readonly form = inject(FormBuilder).nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)]],
    confirmation: ['', Validators.required],
  });
  protected readonly done = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected async reset(): Promise<void> {
    const { password, confirmation } = this.form.getRawValue();
    if (this.form.invalid) {
      this.error.set(`Use at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirmation) {
      this.error.set('The passwords do not match.');
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.api.invoke(adminResetPassword, { body: { token: this.token(), password } });
      this.done.set(true);
    } catch (error) {
      this.error.set(
        authErrorMessage(error, 'This reset link is invalid or has expired. Request a new one.'),
      );
    } finally {
      this.busy.set(false);
    }
  }
}
