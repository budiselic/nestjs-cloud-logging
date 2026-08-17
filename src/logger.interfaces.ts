import type { Options as LoggingWinstonOptions } from '@google-cloud/logging-winston';

export interface HttpLoggingOptions {
  /** Capture request headers. Sensitive headers are always redacted. */
  captureHeaders?: boolean;
  /** Capture the request body after redacting common secret fields. */
  captureBody?: boolean;
  /** Decode the bearer-token payload and expose it as `user` metadata. */
  captureUser?: boolean;
  /** Header used as the request ID. A UUID is generated when it is absent. */
  requestIdHeader?: string;
  /** Additional request headers whose values must be redacted. */
  redactHeaders?: readonly string[];
  /** Additional request-body field names whose values must be redacted. */
  redactFields?: readonly string[];
  /** Replacement used for redacted values. */
  redactedValue?: string;
}

export interface WinstonLoggerModuleOptions {
  /** Register the module globally. Defaults to false. */
  isGlobal?: boolean;
  /** Winston's minimum log level. Defaults to `debug`. */
  level?: string;
  /** Metadata attached to every cloud log entry. */
  defaultMeta?: Record<string, unknown>;
  /** Google Cloud project ID. Usually omitted when using ADC. */
  projectId?: string;
  /** Path to a Google Cloud service-account key. Prefer ADC when possible. */
  keyFilename?: string;
  /** Additional options passed to the Google Cloud Winston transport. */
  transportOptions?: LoggingWinstonOptions;
  /** Set to false to disable automatic HTTP request logging. */
  http?: HttpLoggingOptions | false;
}
