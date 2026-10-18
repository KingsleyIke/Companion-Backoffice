import { Route } from '@angular/router';

import { redirectSignedIn, requireSignIn } from './auth/auth.guards';
import { Shell } from './shell/shell';

export const appRoutes: Route[] = [
  {
    path: 'login',
    title: 'Sign in',
    canActivate: [redirectSignedIn],
    loadComponent: () => import('./auth/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'forgot-password',
    title: 'Reset your password',
    loadComponent: () => import('./auth/forgot-password-page').then((m) => m.ForgotPasswordPage),
  },
  {
    path: 'reset-password',
    title: 'Set a new password',
    loadComponent: () => import('./auth/reset-password-page').then((m) => m.ResetPasswordPage),
  },
  {
    path: '',
    component: Shell,
    canActivate: [requireSignIn],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dioceses' },
      {
        path: 'dioceses',
        title: 'Dioceses',
        loadComponent: () => import('./dioceses/dioceses-page').then((m) => m.DiocesesPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
