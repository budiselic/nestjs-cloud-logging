import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import type { IncomingHttpHeaders } from 'http';
import { LoggerService } from './logger.service';
import { loggerStorage } from './logger.storage';
import { randomUUID } from 'crypto';
import { WinstonLoggerOptions, WinstonLoggerService } from './logger.constants';
import { getDurationInMilliseconds } from './logger.utils';
import type {
  HttpLoggingOptions,
  WinstonLoggerModuleOptions,
} from './logger.interfaces';
import {
  decodeJwtPayload,
  getBearerToken,
  redactBody,
  redactHeaders,
} from './http.utils';

interface HttpRequest {
  body?: unknown;
  get(name: string): string | undefined;
  headers: IncomingHttpHeaders;
  ip?: string;
  method: string;
  originalUrl: string;
  params: Record<string, string>;
  protocol: string;
}

interface HttpResponse {
  statusCode: number;
  writableFinished: boolean;
  get(name: string): string | undefined;
  once(event: 'finish' | 'close', listener: () => void): unknown;
}

type NextFunction = () => void;

const DEFAULT_HTTP_OPTIONS: Required<
  Pick<
    HttpLoggingOptions,
    | 'captureHeaders'
    | 'captureBody'
    | 'captureUser'
    | 'requestIdHeader'
    | 'redactedValue'
  >
> = {
  captureHeaders: true,
  captureBody: true,
  captureUser: true,
  requestIdHeader: 'x-request-id',
  redactedValue: '[REDACTED]',
};

@Injectable()
export class HttpMiddleware implements NestMiddleware {
  constructor(
    @Inject(WinstonLoggerService) private readonly logger: LoggerService,
    @Inject(WinstonLoggerOptions)
    private readonly loggerOptions: WinstonLoggerModuleOptions,
  ) {}

  use(req: HttpRequest, res: HttpResponse, next: NextFunction): void {
    const options: HttpLoggingOptions = {
      ...DEFAULT_HTTP_OPTIONS,
      ...(this.loggerOptions.http || {}),
    };
    const store = new Map<string, unknown>();
    const start = process.hrtime();
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const requestIdHeader = options.requestIdHeader!.toLowerCase();
    const incomingRequestId = req.headers[requestIdHeader];
    const requestId = Array.isArray(incomingRequestId)
      ? incomingRequestId[0]
      : incomingRequestId;

    store.set('requestId', requestId || randomUUID());
    store.set('protocol', req.protocol);
    store.set('method', method);
    store.set('originalUrl', originalUrl);
    store.set('params', req.params);

    if (options.captureHeaders) {
      store.set(
        'headers',
        redactHeaders(
          req.headers,
          options.redactHeaders,
          options.redactedValue,
        ),
      );
    }

    if (options.captureBody) {
      store.set(
        'body',
        redactBody(req.body, options.redactFields, options.redactedValue),
      );
    }

    if (options.captureUser) {
      const token = getBearerToken(req.headers.authorization);
      const user = token ? decodeJwtPayload(token) : undefined;
      if (user !== undefined) store.set('user', user);
    }

    let responseLogged = false;

    const logResponse = (aborted: boolean): void => {
      if (responseLogged) return;
      responseLogged = true;

      const durationInMilliseconds = getDurationInMilliseconds(start);
      const { statusCode } = res;
      const contentLength = res.get('content-length');

      loggerStorage.run(store, () => {
        store.set('contentLength', contentLength);
        store.set('statusCode', statusCode);
        store.set('duration', durationInMilliseconds);
        store.set('params', req.params);
        if (aborted) store.set('aborted', true);

        this.logger.log(
          `${method} ${originalUrl} ${statusCode} ${contentLength || '-'} - ${userAgent} ${ip || '-'}`,
        );
      });
    };

    res.once('finish', () => logResponse(false));
    res.once('close', () => {
      if (!res.writableFinished) logResponse(true);
    });

    loggerStorage.run(store, next);
  }
}
