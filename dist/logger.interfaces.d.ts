import type { Options as LoggingWinstonOptions } from '@google-cloud/logging-winston';
export interface HttpLoggingOptions {
    captureHeaders?: boolean;
    captureBody?: boolean;
    captureUser?: boolean;
    requestIdHeader?: string;
    redactHeaders?: readonly string[];
    redactFields?: readonly string[];
    redactedValue?: string;
}
export interface WinstonLoggerModuleOptions {
    isGlobal?: boolean;
    level?: string;
    defaultMeta?: Record<string, unknown>;
    projectId?: string;
    keyFilename?: string;
    transportOptions?: LoggingWinstonOptions;
    http?: HttpLoggingOptions | false;
}
