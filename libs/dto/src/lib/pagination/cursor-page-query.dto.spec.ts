import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CursorPageQueryDto } from './cursor-page-query.dto';

describe('CursorPageQueryDto', () => {
  const errorsFor = async (query: Record<string, string>) =>
    (await validate(plainToInstance(CursorPageQueryDto, query))).map((e) => e.property);

  it('defaults to the first page of 50', async () => {
    const query = plainToInstance(CursorPageQueryDto, {});
    expect(query.cursor).toBeUndefined();
    expect(query.limit).toBe(50);
    expect(await errorsFor({})).toEqual([]);
  });

  it('accepts a query-string limit within 1-100', async () => {
    expect(plainToInstance(CursorPageQueryDto, { limit: '20' }).limit).toBe(20);
    expect(await errorsFor({ limit: '100' })).toEqual([]);
  });

  it.each(['0', '101', '2.5', 'abc'])('rejects limit=%s', async (limit) => {
    expect(await errorsFor({ limit })).toEqual(['limit']);
  });
});
