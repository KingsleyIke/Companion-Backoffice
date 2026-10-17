import { ServiceUnavailableException } from '@nestjs/common';
import type { DataSource } from 'typeorm';

import { HealthController } from './health.controller';

const controllerWith = (query: () => Promise<unknown>) =>
  new HealthController({ query } as unknown as DataSource);

describe('HealthController', () => {
  it('reports live without touching the database', () => {
    expect(controllerWith(() => Promise.reject(new Error('down'))).live()).toEqual({
      status: 'ok',
    });
  });

  it('reports ready when the database answers', async () => {
    await expect(
      controllerWith(() => Promise.resolve([{ '?column?': 1 }])).ready(),
    ).resolves.toEqual({
      status: 'ok',
    });
  });

  it('answers 503 when the database fails', async () => {
    await expect(controllerWith(() => Promise.reject(new Error('down'))).ready()).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('answers 503 after two seconds when the database hangs', async () => {
    jest.useFakeTimers();
    const ready = controllerWith(() => new Promise(() => undefined)).ready();
    jest.advanceTimersByTime(2_000);
    await expect(ready).rejects.toThrow(ServiceUnavailableException);
    jest.useRealTimers();
  });
});
