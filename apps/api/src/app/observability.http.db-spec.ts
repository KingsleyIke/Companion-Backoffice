import { Controller, Get, INestApplication, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Public } from '@companion/common';

import { AppModule } from './app.module';
import { configureApp } from './configure-app';

@Public()
@Controller('observability-test')
class FailingController {
  @Get('crash')
  crash(): never {
    throw new Error('relation "admin_user" leaked password_hash=$argon2id$secret');
  }
}

// Boots the real app; nothing is written to the database.
describe('errors, health and request logs over HTTP (database)', () => {
  let app: INestApplication;
  const server = () => app.getHttpServer();

  beforeAll(async () => {
    Object.assign(process.env, {
      NODE_ENV: 'test',
      JWT_ACCESS_SECRET: 'a-test-signing-secret-that-is-long-enough',
      MFA_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString('base64'),
      BACK_OFFICE_URL: 'http://localhost:4200',
    });
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [FailingController],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    configureApp(app);
    await app.init();
  });
  afterAll(() => app.close());
  afterEach(() => jest.restoreAllMocks());

  it('answers an unexpected error with a bare 500 that names the request, not the cause', async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const response = await request(server()).get('/api/v1/observability-test/crash').expect(500);

    expect(response.body).toEqual({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Internal server error',
      details: [],
      requestId: response.headers['x-request-id'],
    });
    expect(JSON.stringify(response.body)).not.toMatch(/admin_user|argon2|secret/);
  });

  it('uses the same body for unknown routes and validation errors', async () => {
    const notFound = await request(server()).get('/api/v1/no-such-route').expect(404);
    expect(notFound.body).toMatchObject({ statusCode: 404, error: 'Not Found', details: [] });

    const invalid = await request(server())
      .post('/api/v1/admin/auth/login')
      .send({ email: 'not-an-email', password: 'x' })
      .expect(400);
    expect(invalid.body).toMatchObject({
      statusCode: 400,
      message: 'Validation failed',
      details: ['email must be an email'],
      requestId: invalid.headers['x-request-id'],
    });
  });

  it('reports live and ready', async () => {
    await request(server()).get('/api/v1/health/live').expect(200, { status: 'ok' });
    await request(server()).get('/api/v1/health/ready').expect(200, { status: 'ok' });
  });

  it('logs each request without its query string, client address or user agent', async () => {
    const logged = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const response = await request(server())
      .get('/api/v1/dioceses?cursor=ada@example.org')
      .set('User-Agent', 'Secret-Browser/1.0')
      .expect(400);

    const line = logged.mock.calls.map(([message]) => message).find((m) => typeof m === 'object');
    expect(line).toEqual({
      requestId: response.headers['x-request-id'],
      method: 'GET',
      path: '/api/v1/dioceses',
      status: 400,
      durationMs: expect.any(Number),
    });
    expect(JSON.stringify(logged.mock.calls)).not.toMatch(
      /ada@example|Secret-Browser|127\.0\.0\.1|::1/,
    );
  });
});
