import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { NodeEnv } from '@companion/common';

import type { RequestContext } from './auth-audit';

export const ADMIN_AUTH_ROUTE = 'admin/auth';
export const REFRESH_COOKIE = 'cc_admin_refresh';
export const CSRF_HEADER = 'X-Requested-With';
export const CSRF_HEADER_VALUE = 'XMLHttpRequest';

// What the controller uses of Express's request and response, typed structurally.
export interface AuthHttpRequest {
  ip?: string;
  cookies: Record<string, string | undefined>;
  get(name: string): string | undefined;
}

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict';
  path: string;
  maxAge?: number;
}

export interface CookieResponse {
  cookie(name: string, value: string, options: CookieOptions): unknown;
  clearCookie(name: string, options: CookieOptions): unknown;
}

// httpOnly: never readable by page script. SameSite=Strict and the narrow path keep it off
// every request except the auth endpoints, from the back office's own site.
export function refreshCookieOptions(nodeEnv: NodeEnv, apiPrefix: string): CookieOptions {
  return {
    httpOnly: true,
    secure: nodeEnv === 'staging' || nodeEnv === 'production',
    sameSite: 'strict',
    path: `/${apiPrefix}/${ADMIN_AUTH_ROUTE}`,
  };
}

export function requestContext(request: AuthHttpRequest): RequestContext {
  return { ipAddress: request.ip ?? null, userAgent: request.get('user-agent') ?? null };
}

// CSRF defence for the cookie-authenticated endpoints, on top of SameSite=Strict: a cross-site
// form cannot set custom headers, and a cross-site script needs a CORS preflight we never allow.
@Injectable()
export class CsrfHeaderGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthHttpRequest>();
    if (request.get(CSRF_HEADER) !== CSRF_HEADER_VALUE) {
      throw new ForbiddenException(`Missing ${CSRF_HEADER} header`);
    }
    return true;
  }
}
