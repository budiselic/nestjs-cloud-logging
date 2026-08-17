import type { IncomingHttpHeaders } from 'http';

const DEFAULT_REDACTED_HEADERS = [
  'authorization',
  'cookie',
  'proxy-authorization',
  'set-cookie',
  'x-api-key',
];

const DEFAULT_REDACTED_FIELDS = [
  'access_token',
  'accessToken',
  'api_key',
  'apiKey',
  'authorization',
  'cookie',
  'passcode',
  'password',
  'pin',
  'refresh_token',
  'refreshToken',
  'secret',
  'token',
];

const normalizeKey = (key: string): string =>
  key.toLowerCase().replaceAll('-', '').replaceAll('_', '');

const toNormalizedSet = (values: readonly string[]): Set<string> =>
  new Set(values.map(normalizeKey));

export const redactHeaders = (
  headers: IncomingHttpHeaders,
  additionalHeaders: readonly string[] = [],
  redactedValue = '[REDACTED]',
): IncomingHttpHeaders => {
  const redactedHeaders = toNormalizedSet([
    ...DEFAULT_REDACTED_HEADERS,
    ...additionalHeaders,
  ]);

  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [
      key,
      redactedHeaders.has(normalizeKey(key)) ? redactedValue : value,
    ]),
  );
};

export const redactBody = (
  value: unknown,
  additionalFields: readonly string[] = [],
  redactedValue = '[REDACTED]',
): unknown => {
  const redactedFields = toNormalizedSet([
    ...DEFAULT_REDACTED_FIELDS,
    ...additionalFields,
  ]);
  const visited = new WeakSet<object>();

  const visit = (current: unknown): unknown => {
    if (current === null || typeof current !== 'object') return current;
    if (Buffer.isBuffer(current)) return `[Buffer ${current.length} bytes]`;
    if (current instanceof Date) return current.toISOString();
    if (visited.has(current)) return '[Circular]';

    visited.add(current);

    if (Array.isArray(current)) return current.map(visit);

    return Object.fromEntries(
      Object.entries(current).map(([key, item]) => [
        key,
        redactedFields.has(normalizeKey(key)) ? redactedValue : visit(item),
      ]),
    );
  };

  return visit(value);
};

export const getBearerToken = (
  authorization: string | string[] | undefined,
): string | undefined => {
  if (typeof authorization !== 'string') return undefined;

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1];
};

export const decodeJwtPayload = (token: string): unknown => {
  const payload = token.split('.')[1];
  if (!payload) return undefined;

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return undefined;
  }
};
