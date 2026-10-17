import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../../app/app.module';
import { configureApp } from '../../app/configure-app';
import { REFRESH_COOKIE } from './auth-http';

// Boots the whole API against a migrated database. Every request here uses unknown emails or no
// credentials, so nothing is written. Auth settings are test-only values.
describe('admin auth over HTTP (database)', () => {
  let app: INestApplication;
  const server = () => app.getHttpServer();

  beforeAll(async () => {
    Object.assign(process.env, {
      NODE_ENV: 'test',
      JWT_ACCESS_SECRET: 'a-test-signing-secret-that-is-long-enough',
      MFA_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString('base64'),
      BACK_OFFICE_URL: 'http://localhost:4200',
    });
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });
  afterAll(() => app.close());

  it('keeps the dioceses listing public', async () => {
    await request(server()).get('/api/v1/dioceses').expect(200);
  });

  it('requires a valid access token everywhere else', async () => {
    await request(server()).get('/api/v1/admin/auth/me').expect(401);
    await request(server())
      .get('/api/v1/admin/auth/me')
      .set('Authorization', 'Bearer not.a.jwt')
      .expect(401);
  });

  it('requires X-Requested-With on the cookie-authenticated routes', async () => {
    await request(server()).post('/api/v1/admin/auth/refresh').expect(403);
    await request(server())
      .post('/api/v1/admin/auth/refresh')
      .set('X-Requested-With', 'XMLHttpRequest')
      .expect(401);
  });

  it('clears the refresh cookie on logout with the same scoped attributes', async () => {
    const response = await request(server())
      .post('/api/v1/admin/auth/logout')
      .set('X-Requested-With', 'XMLHttpRequest')
      .expect(204);
    const cookie = String(response.headers['set-cookie']);
    expect(cookie).toContain(`${REFRESH_COOKIE}=;`);
    expect(cookie).toContain('Path=/api/v1/admin/auth');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Strict');
  });

  it('validates sign-in input and answers an unknown email like a wrong password', async () => {
    await request(server())
      .post('/api/v1/admin/auth/login')
      .send({ email: 'not-an-email', password: 'x' })
      .expect(400);
    const response = await request(server())
      .post('/api/v1/admin/auth/login')
      .send({ email: 'Nobody@Test.Invalid', password: 'whatever it is' })
      .expect(401);
    expect(response.body.message).toBe('Invalid email or password');
  });

  it('rate-limits sign-in per account however the email is capitalised', async () => {
    const variants = ['Case@Test.Invalid', 'case@test.invalid', 'CASE@TEST.INVALID'];
    for (let attempt = 0; attempt < 5; attempt++) {
      await request(server())
        .post('/api/v1/admin/auth/login')
        .send({ email: variants[attempt % variants.length], password: 'wrong guess' })
        .expect(401);
    }
    await request(server())
      .post('/api/v1/admin/auth/login')
      .send({ email: 'cAsE@test.invalid', password: 'wrong guess' })
      .expect(429);
  });

  it('accepts a reset request for any email and then rate-limits the address', async () => {
    const forgot = () =>
      request(server())
        .post('/api/v1/admin/auth/forgot-password')
        .send({ email: 'nobody@test.invalid' });
    for (let attempt = 0; attempt < 3; attempt++) {
      await forgot().expect(202);
    }
    await forgot().expect(429);
  });
});
