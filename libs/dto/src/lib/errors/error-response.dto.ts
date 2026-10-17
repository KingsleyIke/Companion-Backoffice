import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: 'Bad Request' })
  error!: string;

  @ApiProperty({ example: 'Validation failed' })
  message!: string;

  @ApiProperty({ type: [String], description: 'Individual validation messages; empty otherwise' })
  details!: string[];

  @ApiProperty({ description: 'Matches the X-Request-Id header and the server log line' })
  requestId!: string;
}
