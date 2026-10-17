import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Public } from '@companion/common';

const DATABASE_TIMEOUT_MS = 2_000;

// For the hosting platform, not for clients, so kept out of the OpenAPI spec.
// live: the process is up. ready: it can also reach the database, so it may take traffic.
@ApiExcludeController()
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('live')
  live(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready(): Promise<{ status: 'ok' }> {
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('timed out')), DATABASE_TIMEOUT_MS);
    });
    try {
      await Promise.race([this.dataSource.query('SELECT 1'), timeout]);
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    } finally {
      clearTimeout(timer);
    }
  }
}
