import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { AuthenticatedAdmin, AuthenticatedRequest } from './access-token';

// Only valid behind JwtAuthGuard, which always sets request.admin on non-public routes.
export function authenticatedAdminOf(context: ExecutionContext): AuthenticatedAdmin {
  const { admin } = context.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!admin) {
    throw new Error('No authenticated admin on this request: is the route @Public()?');
  }
  return admin;
}

export const CurrentAdmin = createParamDecorator((_: unknown, context: ExecutionContext) =>
  authenticatedAdminOf(context),
);
