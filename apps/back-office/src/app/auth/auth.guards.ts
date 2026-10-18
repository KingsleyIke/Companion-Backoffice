import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

import { AuthSession } from './auth-session';

export const requireSignIn: CanActivateFn = (_, state) =>
  inject(AuthSession).isSignedIn() ||
  inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });

export const redirectSignedIn: CanActivateFn = () =>
  !inject(AuthSession).isSignedIn() || inject(Router).createUrlTree(['/']);
