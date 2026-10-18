import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';

import { appRoutes } from './app.routes';
import { authInterceptor } from './auth/auth.interceptor';
import { AuthSession } from './auth/auth-session';
import { PageTitle } from './shell/page-title';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    { provide: TitleStrategy, useExisting: PageTitle },
    // A reload resumes the session from the refresh cookie; without one, the guards send the
    // admin to /login.
    provideAppInitializer(() => inject(AuthSession).refresh()),
  ],
};
