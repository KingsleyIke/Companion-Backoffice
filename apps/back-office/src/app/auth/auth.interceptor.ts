import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, switchMap, throwError, catchError } from 'rxjs';

import { AuthSession } from './auth-session';

const AUTH_ROUTES = '/api/v1/admin/auth/';

// Adds the access token, and on a 401 refreshes once and retries. Sign-in, refresh and logout
// calls are passed through untouched so a failed refresh can never loop.
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.url.includes(AUTH_ROUTES) && !request.url.endsWith('/me')) {
    return next(request);
  }
  const session = inject(AuthSession);
  const router = inject(Router);
  const withToken = () => {
    const token = session.accessToken();
    return token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  };

  return next(withToken()).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }
      return from(session.refresh()).pipe(
        switchMap((refreshed) => {
          if (!refreshed) {
            void router.navigate(['/login']);
            return throwError(() => error);
          }
          return next(withToken());
        }),
      );
    }),
  );
};
