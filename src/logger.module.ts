import {
  DynamicModule,
  Inject,
  MiddlewareConsumer,
  Module,
  Scope,
} from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { LoggingWinston } from '@google-cloud/logging-winston';
import winston from 'winston';
import { HttpMiddleware } from './http.middleware';
import {
  WinstonLogger,
  WinstonLoggerOptions,
  WinstonLoggerService,
  WinstonLoggerServiceApp,
} from './logger.constants';
import type { WinstonLoggerModuleOptions } from './logger.interfaces';
import { LoggerService } from './logger.service';

@Module({})
export class WinstonLoggerModule {
  constructor(
    @Inject(WinstonLoggerOptions)
    private readonly options: WinstonLoggerModuleOptions,
  ) {}

  configure(consumer: MiddlewareConsumer): void {
    if (this.options.http === false) return;
    consumer.apply(HttpMiddleware).forRoutes('*');
  }

  static forRoot(options: WinstonLoggerModuleOptions = {}): DynamicModule {
    const winstonOptions: winston.LoggerOptions = {
      level: options.level || 'debug',
      transports: [
        new LoggingWinston({
          projectId: options.projectId,
          keyFilename: options.keyFilename,
          ...options.transportOptions,
        }),
      ],
      defaultMeta: {
        framework: 'nestjs',
        ...options.defaultMeta,
      },
    };

    return {
      module: WinstonLoggerModule,
      providers: [
        {
          provide: WinstonLoggerOptions,
          useValue: options,
        },
        {
          provide: WinstonLogger,
          useFactory() {
            return winston.createLogger(winstonOptions);
          },
        },
        {
          provide: WinstonLoggerService,
          scope: Scope.TRANSIENT,
          inject: [WinstonLogger, INQUIRER],
          useFactory(logger: winston.Logger, inquirer?: object) {
            return new LoggerService(
              logger,
              inquirer?.constructor?.name || LoggerService.name,
            );
          },
        },
        {
          provide: WinstonLoggerServiceApp,
          inject: [WinstonLogger],
          useFactory(logger: winston.Logger) {
            return new LoggerService(logger, 'Application');
          },
        },
      ],
      exports: [WinstonLoggerService, WinstonLoggerServiceApp],
      global: options.isGlobal || false,
    };
  }
}
