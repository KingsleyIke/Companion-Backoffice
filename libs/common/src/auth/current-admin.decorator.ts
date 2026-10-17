import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { AuthenticatedAdmin, AuthenticatedRequest } from './access-token';

// Only valid on routes behind JwtAuthGuard, which always sets request.admin.
export const CurrentAdmin = createParamDecorator(
  (_: unknown, context: ExecutionContext): AuthenticatedAdmin => {
    const { admin } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!admin) {
      throw new Error('@CurrentAdmin() used on a route without an authenticated admin');
    }
    return admin;
  },
);
