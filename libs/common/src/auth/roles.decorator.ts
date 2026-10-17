import { SetMetadata } from '@nestjs/common';
import { ADMIN_ROLES, type AdminRole } from '@companion/entities';

export const ROLES = 'roles';

// Every non-public route must declare who may call it; the app refuses to start otherwise
// (RouteAccessCheck). Pass one of the named sets in permissions.ts, not an ad-hoc list.
export const Roles = (roles: readonly AdminRole[]) => SetMetadata(ROLES, roles);

export const AnyAdmin = () => Roles(ADMIN_ROLES);
