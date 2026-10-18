import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { AuthSessionDto } from '@companion/contracts';

import { AuthSession } from './auth-session';

export const SESSION: AuthSessionDto = {
  accessToken: 'access-1',
  accessTokenExpiresAt: '2026-10-18T00:15:00.000Z',
  admin: {
    id: 'admin-1',
    email: 'ada@test.invalid',
    name: 'Ada Placeholder',
    role: 'admin',
    dioceseScopeId: null,
    status: 'active',
  },
};

const flushed = () => new Promise((resolve) => setTimeout(resolve));

describe('AuthSession', () => {
  let session: AuthSession;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    session = TestBed.inject(AuthSession);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('signs in and holds the access token in memory', async () => {
    const step = session.signIn('ada@test.invalid', 'secret passphrase');
    http
      .expectOne('/api/v1/admin/auth/login')
      .flush({ status: 'authenticated', session: SESSION, mfaToken: null });

    expect(await step).toEqual({ kind: 'signed-in' });
    expect(session.isSignedIn()).toBe(true);
    expect(session.accessToken()).toBe('access-1');
    expect(session.admin()?.name).toBe('Ada Placeholder');
  });

  it('asks a super admin for a code before signing in', async () => {
    const step = session.signIn('root@test.invalid', 'secret passphrase');
    http
      .expectOne('/api/v1/admin/auth/login')
      .flush({ status: 'mfa_required', session: null, mfaToken: 'mfa-1' });
    expect(await step).toEqual({ kind: 'mfa-required', mfaToken: 'mfa-1' });
    expect(session.isSignedIn()).toBe(false);

    const verified = session.completeMfa('mfa-1', '123456');
    const request = http.expectOne('/api/v1/admin/auth/login/mfa');
    expect(request.request.body).toEqual({ mfaToken: 'mfa-1', code: '123456' });
    request.flush(SESSION);
    await verified;
    expect(session.isSignedIn()).toBe(true);
  });

  it('shares one refresh between concurrent callers, with the CSRF header', async () => {
    const first = session.refresh();
    const second = session.refresh();
    await flushed();
    const request = http.expectOne('/api/v1/admin/auth/refresh');
    expect(request.request.headers.get('X-Requested-With')).toBe('XMLHttpRequest');
    request.flush(SESSION);

    expect(await Promise.all([first, second])).toEqual([true, true]);
    expect(session.accessToken()).toBe('access-1');
  });

  it('signs the admin out locally when refresh fails', async () => {
    const refreshed = session.refresh();
    await flushed();
    http
      .expectOne('/api/v1/admin/auth/refresh')
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    expect(await refreshed).toBe(false);
    expect(session.isSignedIn()).toBe(false);
  });

  it('forgets the session even when the logout call fails', async () => {
    const signingIn = session.signIn('ada@test.invalid', 'secret passphrase');
    http
      .expectOne('/api/v1/admin/auth/login')
      .flush({ status: 'authenticated', session: SESSION, mfaToken: null });
    await signingIn;

    const signingOut = session.signOut();
    await flushed();
    http
      .expectOne('/api/v1/admin/auth/logout')
      .flush(null, { status: 503, statusText: 'Service Unavailable' });
    await expect(signingOut).rejects.toBeDefined();
    expect(session.isSignedIn()).toBe(false);
  });
});
