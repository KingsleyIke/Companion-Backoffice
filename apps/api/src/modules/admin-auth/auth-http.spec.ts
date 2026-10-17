import { ExecutionContext, ForbiddenException } from '@nestjs/common';

import {
  CsrfHeaderGuard,
  refreshCookieOptions,
  requestContext,
  type AuthHttpRequest,
} from './auth-http';

const request = (headers: Record<string, string>, ip?: string): AuthHttpRequest => ({
  ip,
  cookies: {},
  get: (name) => headers[name.toLowerCase()],
});

describe('auth HTTP helpers', () => {
  it('scopes the refresh cookie to the auth routes, httpOnly and SameSite=Strict', () => {
    expect(refreshCookieOptions('production', 'api/v1')).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/api/v1/admin/auth',
    });
  });

  it('marks the cookie Secure everywhere except local development and tests', () => {
    expect(refreshCookieOptions('staging', 'api/v1').secure).toBe(true);
    expect(refreshCookieOptions('development', 'api/v1').secure).toBe(false);
    expect(refreshCookieOptions('test', 'api/v1').secure).toBe(false);
  });

  it('requires X-Requested-With on cookie-authenticated routes', () => {
    const guard = new CsrfHeaderGuard();
    const contextFor = (req: AuthHttpRequest) =>
      ({ switchToHttp: () => ({ getRequest: () => req }) }) as unknown as ExecutionContext;

    expect(guard.canActivate(contextFor(request({ 'x-requested-with': 'XMLHttpRequest' })))).toBe(
      true,
    );
    expect(() => guard.canActivate(contextFor(request({})))).toThrow(ForbiddenException);
  });

  it('records the client address and user agent for the audit log', () => {
    expect(requestContext(request({ 'user-agent': 'Browser/1.0' }, '203.0.113.7'))).toEqual({
      ipAddress: '203.0.113.7',
      userAgent: 'Browser/1.0',
    });
    expect(requestContext(request({}))).toEqual({ ipAddress: null, userAgent: null });
  });
});
