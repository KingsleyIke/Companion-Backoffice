import { Logger } from '@nestjs/common';

import { REQUEST_ID_HEADER, requestLogging, type RequestWithId } from './request-logging';

describe('requestLogging', () => {
  afterEach(() => jest.restoreAllMocks());

  it('tags the request and response with one id and logs the outcome without personal data', () => {
    const logged = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const headers: Record<string, string> = {};
    let onFinish = () => undefined as void;
    const request: RequestWithId = { method: 'POST', path: '/api/v1/admin/auth/login' };
    const response = {
      statusCode: 401,
      setHeader: (name: string, value: string) => (headers[name] = value),
      on: (_: 'finish', listener: () => void) => (onFinish = listener),
    };
    const next = jest.fn();

    requestLogging(request, response, next);
    onFinish();

    expect(next).toHaveBeenCalled();
    expect(request.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(headers[REQUEST_ID_HEADER]).toBe(request.requestId);
    expect(logged).toHaveBeenCalledWith({
      requestId: request.requestId,
      method: 'POST',
      path: '/api/v1/admin/auth/login',
      status: 401,
      durationMs: expect.any(Number),
    });
  });
});
