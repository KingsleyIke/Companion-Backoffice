import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'dioceses' },
  {
    path: 'dioceses',
    loadComponent: () => import('./dioceses/dioceses-page').then((m) => m.DiocesesPage),
  },
];
