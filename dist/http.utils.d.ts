import type { IncomingHttpHeaders } from 'http';
export declare const redactHeaders: (headers: IncomingHttpHeaders, additionalHeaders?: readonly string[], redactedValue?: string) => IncomingHttpHeaders;
export declare const redactBody: (value: unknown, additionalFields?: readonly string[], redactedValue?: string) => unknown;
export declare const getBearerToken: (authorization: string | string[] | undefined) => string | undefined;
export declare const decodeJwtPayload: (token: string) => unknown;
