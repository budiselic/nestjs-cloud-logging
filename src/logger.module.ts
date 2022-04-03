import { DynamicModule, MiddlewareConsumer, Module, Scope } from '@nestjs/common';
import { HttpMiddleware } from './http.middleware';
import winston from 'winston';
import { WinstonLogger, WinstonLoggerService, WinstonLoggerServiceApp } from './logger.constants';
import { INQUIRER } from '@nestjs/core';
import { Constructor } from '@nestjs/common/utils/merge-with-values.util';
import { LoggerService } from './logger.service';
import { JwtModule } from '@nestjs/jwt';
import { LoggingWinston } from '@google-cloud/logging-winston';
import { Globals } from '../../../common/globals';

interface LoggerOptions {
  projectId: string;
  keyFilename: string;
  isGlobal: boolean;
}

@Module({})
export class WinstonLoggerModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }

  static forRoot(options: LoggerOptions): DynamicModule {
    const winstonOptions: winston.LoggerOptions = {
      level: 'debug',
      transports: [
        new LoggingWinston({
          projectId: Globals.PROJECT_ID,
          keyFilename: Globals.PROJECT_KEY_PATH,
        }),
      ],
      defaultMeta: {
        framework: 'nestjs',
      },
    };
    return {
      module: WinstonLoggerModule,
      imports: [JwtModule.register({})],
      providers: [
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
          useFactory(logger: winston.Logger, a: Constructor<unknown>) {
            return new LoggerService(logger, a?.constructor.name);
          },
        },
        {
          provide: WinstonLoggerServiceApp,
          inject: [WinstonLogger, INQUIRER],
          useFactory(logger: winston.Logger, a: Constructor<unknown>) {
            return new LoggerService(logger, a?.constructor.name);
          },
        },
      ],
      exports: [WinstonLoggerService, WinstonLoggerServiceApp],
      global: options.isGlobal,
    };
  }
}
