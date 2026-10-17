import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import type { AccessTokenClaims, AuthenticatedRequest } from './access-token';
import { IS_PUBLIC } from './public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [scheme, token] = String(request.headers['authorization'] ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException();
    }

    const claims = await this.jwt.verifyAsync<AccessTokenClaims>(token).catch(() => null);
    if (claims?.typ !== 'access') {
      throw new UnauthorizedException();
    }
    request.admin = {
      id: claims.sub,
      role: claims.role,
      dioceseScopeId: claims.dsc,
      sessionFamilyId: claims.sid,
    };
    return true;
  }
}
