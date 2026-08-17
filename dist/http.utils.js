"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeJwtPayload = exports.getBearerToken = exports.redactBody = exports.redactHeaders = void 0;
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
const normalizeKey = (key) => key.toLowerCase().replaceAll('-', '').replaceAll('_', '');
const toNormalizedSet = (values) => new Set(values.map(normalizeKey));
const redactHeaders = (headers, additionalHeaders = [], redactedValue = '[REDACTED]') => {
    const redactedHeaders = toNormalizedSet([
        ...DEFAULT_REDACTED_HEADERS,
        ...additionalHeaders,
    ]);
    return Object.fromEntries(Object.entries(headers).map(([key, value]) => [
        key,
        redactedHeaders.has(normalizeKey(key)) ? redactedValue : value,
    ]));
};
exports.redactHeaders = redactHeaders;
const redactBody = (value, additionalFields = [], redactedValue = '[REDACTED]') => {
    const redactedFields = toNormalizedSet([
        ...DEFAULT_REDACTED_FIELDS,
        ...additionalFields,
    ]);
    const visited = new WeakSet();
    const visit = (current) => {
        if (current === null || typeof current !== 'object')
            return current;
        if (Buffer.isBuffer(current))
            return `[Buffer ${current.length} bytes]`;
        if (current instanceof Date)
            return current.toISOString();
        if (visited.has(current))
            return '[Circular]';
        visited.add(current);
        if (Array.isArray(current))
            return current.map(visit);
        return Object.fromEntries(Object.entries(current).map(([key, item]) => [
            key,
            redactedFields.has(normalizeKey(key)) ? redactedValue : visit(item),
        ]));
    };
    return visit(value);
};
exports.redactBody = redactBody;
const getBearerToken = (authorization) => {
    if (typeof authorization !== 'string')
        return undefined;
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    return match?.[1];
};
exports.getBearerToken = getBearerToken;
const decodeJwtPayload = (token) => {
    const payload = token.split('.')[1];
    if (!payload)
        return undefined;
    try {
        return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    }
    catch {
        return undefined;
    }
};
exports.decodeJwtPayload = decodeJwtPayload;
//# sourceMappingURL=http.utils.js.map