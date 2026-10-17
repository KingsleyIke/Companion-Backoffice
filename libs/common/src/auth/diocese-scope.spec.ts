import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { AdminRole } from '@companion/entities';

import { assertInScope, dioceseScopeOf } from './diocese-scope';

const admin = (role: AdminRole, dioceseScopeId: string | null) => ({
  id: 'a',
  role,
  dioceseScopeId,
  sessionFamilyId: 's',
});

describe('diocese scope', () => {
  it('scopes diocese admins to their diocese and every other role to all dioceses', () => {
    expect(dioceseScopeOf(admin('diocese_admin', 'lagos'))).toEqual({
      kind: 'diocese',
      dioceseId: 'lagos',
    });
    for (const role of ['super_admin', 'admin', 'content_editor'] as const) {
      expect(dioceseScopeOf(admin(role, null))).toEqual({ kind: 'all' });
    }
  });

  it('fails closed for a diocese admin without a scope', () => {
    expect(() => dioceseScopeOf(admin('diocese_admin', null))).toThrow(ForbiddenException);
  });

  it('hides rows outside the scope, including rows with no diocese, as not found', () => {
    const lagos = { kind: 'diocese', dioceseId: 'lagos' } as const;
    expect(() => assertInScope(lagos, 'lagos')).not.toThrow();
    expect(() => assertInScope(lagos, 'enugu')).toThrow(NotFoundException);
    expect(() => assertInScope(lagos, null)).toThrow(NotFoundException);
    expect(() => assertInScope({ kind: 'all' }, null)).not.toThrow();
  });
});
