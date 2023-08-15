import { ConsoleLogger, Injectable } from '@nestjs/common';
import winston from 'winston';
import { loggerStorage } from './logger.storage';
import { v4 as uuidv4 } from 'uuid';

interface Metadata {
  context?: string;
  stack?: any;
  loggerInstanceId: string;
}

@Injectable()
export class LoggerService extends ConsoleLogger {
  private store: Map<any, any>;
  private metadata: Metadata = {
    loggerInstanceId: uuidv4().split('-')[0],
  };
  private meta: Map<any, any> = new Map();

  constructor(
    private readonly logger?: winston.Logger,
    private inquirer?: string,
  ) {
    super();
    this.metadata.context = this.inquirer || this.constructor.name;
    this.meta.set('context', this.inquirer || this.constructor.name);
    super.setContext(this.metadata.context);
  }

  error(message: any, stack?: string, context?: string) {
    super.error(message, stack, context);

    // Setting metadata
    this.metadata.context = context;
    this.metadata.stack = stack;

    // GCL
    this.store = loggerStorage.getStore();
    if (this.store)
      Object.assign(this.metadata, Object.fromEntries(this.store));
    this.logger.error(message, this.metadata);
  }

  log(message: any, context?: string) {
    super.log(message);

    // GCL
    this.store = loggerStorage.getStore();
    if (this.store)
      Object.assign(this.metadata, Object.fromEntries(this.store));
    this.logger.info(message, this.metadata);
  }

  debug(message: any, context?: string) {
    super.debug(message);

    // GCL
    this.store = loggerStorage.getStore();
    if (this.store)
      Object.assign(this.metadata, Object.fromEntries(this.store));
    this.logger.debug(message, this.metadata);
  }

  warn(message: any, context?: string) {
    super.warn(message);

    // GCL
    this.store = loggerStorage.getStore();
    if (this.store)
      Object.assign(this.metadata, Object.fromEntries(this.store));
    this.logger.warn(message, this.metadata);
  }

  verbose(message: any, context?: string) {
    super.verbose(message);

    // GCL
    this.store = loggerStorage.getStore();
    if (this.store)
      Object.assign(this.metadata, Object.fromEntries(this.store));
    this.logger.verbose(message, this.metadata);
  }
}
