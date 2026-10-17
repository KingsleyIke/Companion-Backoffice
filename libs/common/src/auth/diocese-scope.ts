import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import type { AuthenticatedAdmin } from './access-token';
import { authenticatedAdminOf } from './current-admin.decorator';

// Hard rule 13: a diocese admin sees and changes only their own diocese, enforced in the query
// layer. Every other role is national. Rows with no diocese (chaplaincies outside one) are
// visible only to national roles.
export type DioceseScope = { kind: 'all' } | { kind: 'diocese'; dioceseId: string };

export function dioceseScopeOf(admin: AuthenticatedAdmin): DioceseScope {
  if (admin.role !== 'diocese_admin') {
    return { kind: 'all' };
  }
  // Fail closed: a diocese admin without a scope must never fall back to every diocese.
  if (!admin.dioceseScopeId) {
    throw new ForbiddenException();
  }
  return { kind: 'diocese', dioceseId: admin.dioceseScopeId };
}

export const CurrentScope = createParamDecorator((_: unknown, context: ExecutionContext) =>
  dioceseScopeOf(authenticatedAdminOf(context)),
);

// For list queries: `column` is the query's diocese property path, e.g. 'parish.dioceseId'.
export function applyDioceseScope<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  column: string,
  scope: DioceseScope,
): SelectQueryBuilder<T> {
  return scope.kind === 'all'
    ? query
    : query.andWhere(`${column} = :scopeDioceseId`, { scopeDioceseId: scope.dioceseId });
}

// For single rows, before reading or changing them. 404 rather than 403, so an out-of-scope
// admin cannot even learn that the row exists.
export function assertInScope(scope: DioceseScope, dioceseId: string | null): void {
  if (scope.kind === 'diocese' && dioceseId !== scope.dioceseId) {
    throw new NotFoundException();
  }
}
