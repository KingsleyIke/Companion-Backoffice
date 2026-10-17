import { randomUUID } from 'node:crypto';

import { Logger } from '@nestjs/common';

// What the middleware uses of Express, typed structurally.
export interface RequestWithId {
  method: string;
  path: string;
  requestId?: string;
}

interface LoggedResponse {
  statusCode: number;
  setHeader(name: string, value: string): unknown;
  on(event: 'finish', listener: () => void): unknown;
}

export const REQUEST_ID_HEADER = 'X-Request-Id';

const logger = new Logger('HTTP');

// One line per request: method, path (never the query string), status, duration and a request
// id. No body, headers, client address or user agent, so no personal data reaches the logs
// (NDPR). The id is generated here, never taken from the client, and returned so a user's
// error report can be matched to the log line.
export function requestLogging(
  request: RequestWithId,
  response: LoggedResponse,
  next: () => void,
): void {
  const requestId = randomUUID();
  const startedAt = performance.now();
  request.requestId = requestId;
  response.setHeader(REQUEST_ID_HEADER, requestId);
  response.on('finish', () => {
    logger.log({
      requestId,
      method: request.method,
      path: request.path,
      status: response.statusCode,
      durationMs: Math.round(performance.now() - startedAt),
    });
  });
  next();
}
