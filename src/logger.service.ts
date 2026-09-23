import { ConsoleLogger, Injectable } from '@nestjs/common';
import type { Logger as WinstonLogger } from 'winston';
import { randomUUID } from 'crypto';
import { loggerStorage } from './logger.storage';

interface LoggerMetadata extends Record<string, unknown> {
  context?: string;
  stack?: string;
  loggerInstanceId: string;
}

@Injectable()
export class LoggerService extends ConsoleLogger {
  private readonly loggerInstanceId = randomUUID().split('-')[0];

  constructor(
    private readonly logger: WinstonLogger,
    context = LoggerService.name,
  ) {
    super(context);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.isLevelEnabled('error')) return;
    super.error(message, ...optionalParams);

    const { context, stack } = this.getErrorContextAndStack(optionalParams);
    this.logger.error(
      this.serializeMessage(message),
      this.getMetadata(context, stack),
    );
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.isLevelEnabled('log')) return;
    super.log(message, ...optionalParams);
    this.logger.info(
      this.serializeMessage(message),
      this.getMetadata(this.getContext(optionalParams)),
    );
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.isLevelEnabled('debug')) return;
    super.debug(message, ...optionalParams);
    this.logger.debug(
      this.serializeMessage(message),
      this.getMetadata(this.getContext(optionalParams)),
    );
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.isLevelEnabled('warn')) return;
    super.warn(message, ...optionalParams);
    this.logger.warn(
      this.serializeMessage(message),
      this.getMetadata(this.getContext(optionalParams)),
    );
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.isLevelEnabled('verbose')) return;
    super.verbose(message, ...optionalParams);
    this.logger.verbose(
      this.serializeMessage(message),
      this.getMetadata(this.getContext(optionalParams)),
    );
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.isLevelEnabled('fatal')) return;
    super.fatal(message, ...optionalParams);
    this.logger.error(
      this.serializeMessage(message),
      this.getMetadata(this.getContext(optionalParams), undefined, 'fatal'),
    );
  }

  private getContext(optionalParams: readonly unknown[]): string | undefined {
    const context = optionalParams[optionalParams.length - 1];
    return typeof context === 'string' ? context : undefined;
  }

  private serializeMessage(message: unknown): string {
    if (typeof message === 'string') return message;
    if (message instanceof Error) return message.stack || message.message;

    try {
      return (
        JSON.stringify(message, (_key, value: unknown) =>
          typeof value === 'bigint' ? value.toString() : value,
        ) || String(message)
      );
    } catch {
      return String(message);
    }
  }

  private getErrorContextAndStack(optionalParams: readonly unknown[]): {
    context?: string;
    stack?: string;
  } {
    if (optionalParams.length === 0) return {};

    if (optionalParams.length === 1) {
      const value = optionalParams[0];
      if (typeof value !== 'string') return {};
      return this.isStack(value) ? { stack: value } : { context: value };
    }

    const context = this.getContext(optionalParams);
    const stackCandidate = optionalParams[optionalParams.length - 2];
    const stack =
      typeof stackCandidate === 'string' ? stackCandidate : undefined;
    return { context, stack };
  }

  private isStack(value: string): boolean {
    return /^(.)+\n\s+at .+:\d+:\d+/.test(value);
  }

  private getMetadata(
    context?: string,
    stack?: string,
    nestLevel?: string,
  ): LoggerMetadata {
    const store = loggerStorage.getStore();
    const metadata: LoggerMetadata = {
      ...(store ? Object.fromEntries(store) : {}),
      loggerInstanceId: this.loggerInstanceId,
      context: context || this.context || LoggerService.name,
    };

    if (stack) metadata.stack = stack;
    if (nestLevel) metadata.nestLevel = nestLevel;

    return metadata;
  }
}
