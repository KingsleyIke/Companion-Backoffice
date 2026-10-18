import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { authInterceptor } from './auth.interceptor';
import { AuthSession } from './auth-session';

const flushed = () => new Promise((resolve) => setTimeout(resolve));

describe('authInterceptor', () => {
  let http: HttpTestingController;
  let client: HttpClient;
  let token: string | null;
  let refreshResult: boolean;
  const refresh = jest.fn();
  const navigate = jest.fn();

  beforeEach(() => {
    token = 'access-1';
    refreshResult = true;
    refresh.mockReset().mockImplementation(async () => {
      token = refreshResult ? 'access-2' : null;
      return refreshResult;
    });
    navigate.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthSession, useValue: { accessToken: () => token, refresh } },
        { provide: Router, useValue: { navigate } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    client = TestBed.inject(HttpClient);
  });
  afterEach(() => http.verify());

  it('adds the access token', () => {
    void firstValueFrom(client.get('/api/v1/admin/things'));
    expect(http.expectOne('/api/v1/admin/things').request.headers.get('Authorization')).toBe(
      'Bearer access-1',
    );
  });

  it('leaves sign-in, refresh and logout calls untouched', () => {
    void firstValueFrom(client.post('/api/v1/admin/auth/refresh', null));
    expect(http.expectOne('/api/v1/admin/auth/refresh').request.headers.has('Authorization')).toBe(
      false,
    );
  });

  it('refreshes once and retries with the new token after a 401', async () => {
    const result = firstValueFrom(client.get('/api/v1/admin/things'));
    http.expectOne('/api/v1/admin/things').flush(null, { status: 401, statusText: 'Unauthorized' });
    await flushed();
    const retry = http.expectOne('/api/v1/admin/things');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer access-2');
    retry.flush({ ok: true });

    expect(await result).toEqual({ ok: true });
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('sends the admin to sign in when the refresh fails', async () => {
    refreshResult = false;
    const result = firstValueFrom(client.get('/api/v1/admin/things'));
    http.expectOne('/api/v1/admin/things').flush(null, { status: 401, statusText: 'Unauthorized' });

    await expect(result).rejects.toMatchObject({ status: 401 });
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('passes other errors straight through', async () => {
    const result = firstValueFrom(client.get('/api/v1/admin/things'));
    http.expectOne('/api/v1/admin/things').flush(null, { status: 403, statusText: 'Forbidden' });
    await expect(result).rejects.toMatchObject({ status: 403 });
    expect(refresh).not.toHaveBeenCalled();
  });
});
