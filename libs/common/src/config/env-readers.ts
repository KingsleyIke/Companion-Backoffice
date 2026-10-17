export type Source = Record<string, string | undefined>;

export function readOptional(source: Source, key: string): string | undefined {
  const value = source[key]?.trim();
  return value ? value : undefined;
}

export function readOneOf<T extends string>(
  source: Source,
  key: string,
  allowed: readonly T[],
  fallback: T,
  errors: string[],
): T {
  const value = readOptional(source, key);
  if (value === undefined) {
    return fallback;
  }
  if (!(allowed as readonly string[]).includes(value)) {
    errors.push(`${key} must be one of: ${allowed.join(', ')}`);
    return fallback;
  }
  return value as T;
}

export function readPort(source: Source, key: string, fallback: number, errors: string[]): number {
  const value = readOptional(source, key);
  if (value === undefined) {
    return fallback;
  }
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push(`${key} must be an integer between 1 and 65535`);
    return fallback;
  }
  return port;
}

export function readBoolean(
  source: Source,
  key: string,
  fallback: boolean,
  errors: string[],
): boolean {
  const value = readOptional(source, key);
  if (value === undefined) {
    return fallback;
  }
  if (value !== 'true' && value !== 'false') {
    errors.push(`${key} must be "true" or "false"`);
    return fallback;
  }
  return value === 'true';
}

// Error messages never echo the value: connection strings carry the password.
export function readPostgresUrl(source: Source, key: string, errors: string[]): string {
  const value = readOptional(source, key);
  if (value === undefined) {
    errors.push(`${key} is required`);
    return '';
  }
  try {
    const { protocol } = new URL(value);
    if (protocol !== 'postgres:' && protocol !== 'postgresql:') {
      errors.push(`${key} must be a postgres:// or postgresql:// URL`);
    }
  } catch {
    errors.push(`${key} is not a valid URL`);
  }
  return value;
}

export function readPositiveInt(
  source: Source,
  key: string,
  fallback: number,
  errors: string[],
): number {
  const value = readOptional(source, key);
  if (value === undefined) {
    return fallback;
  }
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    errors.push(`${key} must be a positive integer`);
    return fallback;
  }
  return number;
}

// Error messages never echo the value: it is a secret.
export function readSecret(
  source: Source,
  key: string,
  minLength: number,
  errors: string[],
): string {
  const value = readOptional(source, key);
  if (value === undefined || value.length < minLength) {
    errors.push(`${key} is required and must be at least ${minLength} characters`);
    return '';
  }
  return value;
}

// Error messages never echo the value: it is a key.
export function readBase64Key(
  source: Source,
  key: string,
  bytes: number,
  errors: string[],
): Buffer | undefined {
  const value = readOptional(source, key);
  if (value === undefined) {
    return undefined;
  }
  const decoded = Buffer.from(value, 'base64');
  if (decoded.length !== bytes || decoded.toString('base64') !== value) {
    errors.push(`${key} must be ${bytes} bytes, base64-encoded`);
    return undefined;
  }
  return decoded;
}

export function readHttpUrl(source: Source, key: string, errors: string[]): string {
  const value = readOptional(source, key);
  if (value === undefined) {
    errors.push(`${key} is required`);
    return '';
  }
  try {
    const { protocol } = new URL(value);
    if (protocol !== 'http:' && protocol !== 'https:') {
      errors.push(`${key} must be an http:// or https:// URL`);
    }
  } catch {
    errors.push(`${key} is not a valid URL`);
  }
  return value.replace(/\/+$/, '');
}
