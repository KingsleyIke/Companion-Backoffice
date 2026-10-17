// Opaque keyset cursor: the sort-key values of the last row on a page, base64url-encoded.
export function encodeCursor(position: readonly string[]): string {
  return Buffer.from(JSON.stringify(position)).toString('base64url');
}

// Returns null for anything that is not a cursor this API issued with the given number of keys.
export function decodeCursor(cursor: string, keyCount: number): string[] | null {
  try {
    const position: unknown = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    return Array.isArray(position) &&
      position.length === keyCount &&
      position.every((key) => typeof key === 'string')
      ? position
      : null;
  } catch {
    return null;
  }
}
