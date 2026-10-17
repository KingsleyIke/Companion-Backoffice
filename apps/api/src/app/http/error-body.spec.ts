import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';

import { toErrorBody } from './error-body';

describe('toErrorBody', () => {
  it('keeps an expected error’s status and message', () => {
    expect(toErrorBody(new UnauthorizedException('Invalid email or password'), 'req-1')).toEqual({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid email or password',
      details: [],
      requestId: 'req-1',
    });
    expect(toErrorBody(new NotFoundException(), 'req-2')).toMatchObject({
      statusCode: 404,
      error: 'Not Found',
      message: 'Not Found',
    });
  });

  it('moves validation messages into details', () => {
    const validation = new BadRequestException(['email must be an email', 'password is too long']);
    expect(toErrorBody(validation, 'req-3')).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      details: ['email must be an email', 'password is too long'],
      requestId: 'req-3',
    });
  });

  it('keeps a deliberate 5xx', () => {
    expect(toErrorBody(new ServiceUnavailableException('Database unavailable'), 'r')).toMatchObject(
      {
        statusCode: 503,
        message: 'Database unavailable',
      },
    );
  });

  it('never reveals what an unexpected error said', () => {
    const body = toErrorBody(
      new Error('relation "admin_user" password_hash=$argon2id...'),
      'req-4',
    );
    expect(body).toEqual({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Internal server error',
      details: [],
      requestId: 'req-4',
    });
    expect(JSON.stringify(toErrorBody('a thrown string', 'r'))).not.toContain('thrown');
  });
});
