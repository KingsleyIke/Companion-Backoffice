import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import type { AuthenticatedRequest } from './access-token';
import { JwtAuthGuard } from './jwt-auth.guard';

const jwt = new JwtService({ secret: 'a-test-signing-secret-that-is-long-enough' });

function contextFor(request: AuthenticatedRequest, isPublic: boolean) {
  const reflector = { getAllAndOverride: () => isPublic } as unknown as Reflector;
  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { guard: new JwtAuthGuard(reflector, jwt), context };
}

const bearer = (token: string): AuthenticatedRequest => ({
  headers: { authorization: `Bearer ${token}` },
});

describe('JwtAuthGuard', () => {
  it('lets @Public() routes through without a token', async () => {
    const { guard, context } = contextFor({ headers: {} }, true);
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it.each([
    ['no header', { headers: {} }],
    ['a non-Bearer scheme', { headers: { authorization: 'Basic abc' } }],
    ['a garbage token', bearer('not.a.jwt')],
  ])('rejects %s', async (_, request) => {
    const { guard, context } = contextFor(request, false);
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a validly signed token that is not an access token', async () => {
    const mfaToken = await jwt.signAsync({ sub: 'admin-1', typ: 'mfa' });
    const { guard, context } = contextFor(bearer(mfaToken), false);
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('attaches the admin from a valid access token', async () => {
    const token = await jwt.signAsync({
      sub: 'admin-1',
      role: 'diocese_admin',
      dsc: 'diocese-1',
      sid: 'family-1',
      typ: 'access',
    });
    const request = bearer(token);
    const { guard, context } = contextFor(request, false);
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.admin).toEqual({
      id: 'admin-1',
      role: 'diocese_admin',
      dioceseScopeId: 'diocese-1',
      sessionFamilyId: 'family-1',
    });
  });
});
