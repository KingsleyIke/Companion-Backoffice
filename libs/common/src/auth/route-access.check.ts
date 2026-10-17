import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

import { IS_PUBLIC } from './public.decorator';
import { ROLES } from './roles.decorator';

// Deny by default, checked at start-up: every route must be @Public() or declare @Roles /
// @AnyAdmin. A forgotten decorator stops the app booting (and the HTTP specs) instead of
// shipping a route any signed-in admin can call.
@Injectable()
export class RouteAccessCheck implements OnApplicationBootstrap {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  onApplicationBootstrap(): void {
    const undeclared = this.discovery.getControllers().flatMap(({ instance, metatype }) => {
      if (!instance || !metatype) {
        return [];
      }
      const prototype: object = Object.getPrototypeOf(instance);
      return this.scanner
        .getAllMethodNames(prototype)
        .filter((name) => {
          const handler: unknown = Reflect.get(prototype, name);
          if (typeof handler !== 'function' || !Reflect.hasMetadata(PATH_METADATA, handler)) {
            return false;
          }
          const targets = [handler, metatype];
          return !(
            this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, targets) ||
            this.reflector.getAllAndOverride<unknown>(ROLES, targets)
          );
        })
        .map((name) => `${metatype.name}.${name}`);
    });
    if (undeclared.length > 0) {
      throw new Error(
        `Routes must be @Public() or declare @Roles()/@AnyAdmin(): ${undeclared.join(', ')}`,
      );
    }
  }
}
