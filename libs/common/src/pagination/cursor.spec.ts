import { decodeCursor, encodeCursor } from './cursor';

describe('cursor', () => {
  it('round-trips the sort-key values of the last row', () => {
    expect(decodeCursor(encodeCursor(['Abuja', 'some-id']), 2)).toEqual(['Abuja', 'some-id']);
  });

  it.each([
    ['not base64 JSON', '%%%'],
    ['the wrong number of keys', encodeCursor(['only-one'])],
    ['non-string keys', Buffer.from(JSON.stringify([1, 2])).toString('base64url')],
    ['a non-array', Buffer.from(JSON.stringify({ name: 'x' })).toString('base64url')],
  ])('rejects %s', (_, cursor) => {
    expect(decodeCursor(cursor, 2)).toBeNull();
  });
});
