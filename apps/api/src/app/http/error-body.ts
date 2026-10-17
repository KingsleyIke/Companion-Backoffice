import { STATUS_CODES } from 'node:http';

import { HttpException, HttpStatus } from '@nestjs/common';
import type { ErrorResponseDto } from '@companion/dto';

// Every error the API returns has this shape. An HttpException keeps its status and message;
// validation messages move to `details`. Anything else is unexpected and becomes a bare 500:
// its stack, SQL or internal text never reaches the client.
export function toErrorBody(exception: unknown, requestId: string): ErrorResponseDto {
  if (!(exception instanceof HttpException)) {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Internal server error',
      details: [],
      requestId,
    };
  }

  const statusCode = exception.getStatus();
  const response = exception.getResponse();
  const { message, error }: Record<string, unknown> =
    typeof response === 'string' ? { message: response } : { ...response };
  const messages = Array.isArray(message) ? message.map(String) : [];

  return {
    statusCode,
    error: typeof error === 'string' ? error : (STATUS_CODES[statusCode] ?? 'Error'),
    message: messages.length > 0 ? 'Validation failed' : String(message ?? exception.message),
    details: messages,
    requestId,
  };
}
