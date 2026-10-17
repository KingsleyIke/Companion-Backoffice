import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

import { toErrorBody } from './error-body';
import type { RequestWithId } from './request-logging';

interface JsonResponse {
  status(code: number): { json(body: unknown): unknown };
}

// Unexpected errors (anything that is not an HttpException) are logged with their stack and
// reported to Sentry; expected ones (4xx, a deliberate 503) are just answered.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<RequestWithId>();
    const body = toErrorBody(exception, request.requestId ?? 'unknown');

    if (!(exception instanceof HttpException)) {
      this.logger.error(
        { requestId: body.requestId, method: request.method, path: request.path },
        exception instanceof Error ? exception.stack : String(exception),
      );
      Sentry.captureException(exception, { tags: { requestId: body.requestId } });
    }

    http.getResponse<JsonResponse>().status(body.statusCode).json(body);
  }
}
