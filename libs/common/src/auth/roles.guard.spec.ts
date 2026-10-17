import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AdminRole } from '@companion/entities';

import type { AuthenticatedRequest } from './access-token';
import { RolesGuard } from './roles.guard';

function check(role: AdminRole, metadata: { isPublic?: boolean; roles?: readonly AdminRole[] }) {
  const reflector = {
    getAllAndOverride: (key: string) => (key === 'isPublic' ? metadata.isPublic : metadata.roles),
  } as unknown as Reflector;
  const request: AuthenticatedRequest = {
    headers: {},
    admin: { id: 'a', role, dioceseScopeId: null, sessionFamilyId: 's' },
  };
  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return () => new RolesGuard(reflector).canActivate(context);
}

describe('RolesGuard', () => {
  it('lets public routes through', () => {
    expect(check('content_editor', { isPublic: true })()).toBe(true);
  });

  it('allows a listed role and refuses any other', () => {
    expect(check('admin', { roles: ['super_admin', 'admin'] })()).toBe(true);
    expect(check('content_editor', { roles: ['super_admin', 'admin'] })).toThrow(
      ForbiddenException,
    );
  });

  it('refuses a route that declares no roles', () => {
    expect(check('super_admin', {})).toThrow(ForbiddenException);
  });
});
