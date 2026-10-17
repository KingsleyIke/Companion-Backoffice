import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AdminRole } from '@companion/entities';

import { authenticatedAdminOf } from './current-admin.decorator';
import { IS_PUBLIC } from './public.decorator';
import { ROLES } from './roles.decorator';

// Runs after JwtAuthGuard. A route without @Roles is refused here too, though RouteAccessCheck
// stops such a route from ever being deployed.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, targets)) {
      return true;
    }
    const roles = this.reflector.getAllAndOverride<readonly AdminRole[] | undefined>(
      ROLES,
      targets,
    );
    if (!roles?.includes(authenticatedAdminOf(context).role)) {
      throw new ForbiddenException();
    }
    return true;
  }
}
