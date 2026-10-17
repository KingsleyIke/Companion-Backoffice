import { Controller, Get, INestApplication, Param } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import {
  assertInScope,
  CurrentScope,
  DEVOTION_EDITORS,
  DIRECTORY_EDITORS,
  LITURGY_EDITORS,
  PLATFORM_ADMINS,
  Roles,
  SUPER_ADMIN_ONLY,
  type AccessTokenClaims,
  type DioceseScope,
} from '@companion/common';
import { ADMIN_ROLES, type AdminRole } from '@companion/entities';

import { AppModule } from './app.module';
import { configureApp } from './configure-app';

// Test-only routes, one per permission set, so the whole guard chain is exercised over HTTP
// against the real app. Tokens are signed directly; nothing touches the database.
@Controller('access-test')
class AccessTestController {
  @Get('super')
  @Roles(SUPER_ADMIN_ONLY)
  superOnly() {
    return 'ok';
  }

  @Get('platform')
  @Roles(PLATFORM_ADMINS)
  platform() {
    return 'ok';
  }

  @Get('liturgy')
  @Roles(LITURGY_EDITORS)
  liturgy() {
    return 'ok';
  }

  @Get('devotions')
  @Roles(DEVOTION_EDITORS)
  devotions() {
    return 'ok';
  }

  @Get('dioceses/:dioceseId')
  @Roles(DIRECTORY_EDITORS)
  diocese(@Param('dioceseId') dioceseId: string, @CurrentScope() scope: DioceseScope) {
    assertInScope(scope, dioceseId);
    return 'ok';
  }
}

@Controller('undeclared-test')
class UndeclaredController {
  @Get()
  forgotten() {
    return 'should never be reachable';
  }
}

const AUTH_ENV = {
  NODE_ENV: 'test',
  JWT_ACCESS_SECRET: 'a-test-signing-secret-that-is-long-enough',
  MFA_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString('base64'),
  BACK_OFFICE_URL: 'http://localhost:4200',
};
const LAGOS = '00000000-0000-7000-8000-0000000000a1';
const ENUGU = '00000000-0000-7000-8000-0000000000a2';

describe('access control over HTTP (database)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    Object.assign(process.env, AUTH_ENV);
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [AccessTestController],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });
  afterAll(() => app.close());

  const tokenFor = (role: AdminRole, dsc: string | null = null) => {
    const claims: AccessTokenClaims = {
      sub: `admin-${role}`,
      role,
      dsc,
      sid: 'family',
      typ: 'access',
    };
    return app.get(JwtService).signAsync(claims);
  };
  const call = async (path: string, role: AdminRole, dsc: string | null = null) =>
    (
      await request(app.getHttpServer())
        .get(`/api/v1/access-test/${path}`)
        .set('Authorization', `Bearer ${await tokenFor(role, dsc)}`)
    ).status;
  const scopeFor = (role: AdminRole) => (role === 'diocese_admin' ? LAGOS : null);

  // The approved matrix (task 1.1.6). 200 = allowed, 403 = wrong role.
  const MATRIX: Record<string, Record<AdminRole, number>> = {
    super: { super_admin: 200, admin: 403, diocese_admin: 403, content_editor: 403 },
    platform: { super_admin: 200, admin: 200, diocese_admin: 403, content_editor: 403 },
    liturgy: { super_admin: 200, admin: 200, diocese_admin: 403, content_editor: 200 },
    devotions: { super_admin: 200, admin: 200, diocese_admin: 200, content_editor: 200 },
    [`dioceses/${LAGOS}`]: {
      super_admin: 200,
      admin: 200,
      diocese_admin: 200,
      content_editor: 403,
    },
  };

  it.each(Object.keys(MATRIX))('lets exactly the right roles call %s', async (path) => {
    const statuses = Object.fromEntries(
      await Promise.all(
        ADMIN_ROLES.map(async (role) => [role, await call(path, role, scopeFor(role))]),
      ),
    );
    expect(statuses).toEqual(MATRIX[path]);
  });

  it('hides another diocese from a diocese admin as not found, but not from national roles', async () => {
    expect(await call(`dioceses/${ENUGU}`, 'diocese_admin', LAGOS)).toBe(404);
    expect(await call(`dioceses/${ENUGU}`, 'admin')).toBe(200);
  });

  it('fails closed for a diocese admin token without a scope', async () => {
    expect(await call(`dioceses/${LAGOS}`, 'diocese_admin', null)).toBe(403);
  });

  it('still requires a token before any role check', async () => {
    await request(app.getHttpServer()).get('/api/v1/access-test/devotions').expect(401);
  });

  it('refuses to start when a route declares neither @Public() nor its roles', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [UndeclaredController],
    }).compile();
    const broken = moduleRef.createNestApplication();
    await expect(broken.init()).rejects.toThrow(
      'Routes must be @Public() or declare @Roles()/@AnyAdmin(): UndeclaredController.forgotten',
    );
    await broken.close();
  });
});
