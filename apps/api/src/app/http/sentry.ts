import * as Sentry from '@sentry/nestjs';
import type { Environment } from '@companion/common';

// Errors only: no performance tracing (free tier), and nothing personal leaves the server.
export function initSentry({ nodeEnv, observability }: Environment): void {
  if (!observability.sentryDsn) {
    return;
  }
  Sentry.init({
    dsn: observability.sentryDsn,
    environment: nodeEnv,
    release: observability.sentryRelease,
    // Sentry 11's per-category switches (it replaced sendDefaultPii): collect none of them.
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
    },
    tracesSampleRate: 0,
    beforeSend: scrubEvent,
  });
}

// Strips everything that can carry personal data or credentials before an event is sent:
// cookies (the refresh token), auth headers, bodies (passwords, emails), query strings and any
// user context. Method, URL path and the request id tag remain.
export function scrubEvent<T extends Sentry.ErrorEvent>(event: T): T {
  if (event.request) {
    const { method, url } = event.request;
    event.request = { method, url: url?.split('?')[0] };
  }
  delete event.user;
  return event;
}
