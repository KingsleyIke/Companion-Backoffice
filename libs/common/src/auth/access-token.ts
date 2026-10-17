import type { AdminRole } from '@companion/entities';

// Kept minimal: role and diocese scope are what the 1.1.6 guards need without a database read.
export interface AccessTokenClaims {
  sub: string;
  role: AdminRole;
  dsc: string | null;
  sid: string;
  typ: 'access';
}

export interface AuthenticatedAdmin {
  id: string;
  role: AdminRole;
  dioceseScopeId: string | null;
  sessionFamilyId: string;
}

export interface AuthenticatedRequest {
  headers: Record<string, string | string[] | undefined>;
  admin?: AuthenticatedAdmin;
}
