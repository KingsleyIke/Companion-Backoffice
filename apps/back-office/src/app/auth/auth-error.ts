import { HttpErrorResponse } from '@angular/common/http';

// What to tell the admin when an auth call fails. The API's own 4xx message is shown where it
// is meant for people (it is never internal: unexpected errors arrive as a bare 500).
export function authErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }
  if (error.status === 429) {
    return 'Too many attempts. Wait a few minutes, then try again.';
  }
  const message: unknown = error.error?.message;
  return error.status >= 400 && error.status < 500 && typeof message === 'string'
    ? message
    : fallback;
}
