import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LoggerService } from './logger.service';
import { loggerStorage } from './logger.storage';
import { v4 as uuidv4 } from 'uuid';
import { WinstonLoggerService } from './logger.constants';
import { getDurationInMilliseconds } from './logger.utils';
import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';

@Injectable()
export class HttpMiddleware implements NestMiddleware {
  constructor(
    @Inject(WinstonLoggerService) private readonly logger: LoggerService,
    private readonly jwtService: JwtService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const store = new Map();
    const start = process.hrtime();
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';

    loggerStorage.run(store, () => {
      next();
      const token = req.headers['authorization']?.replace('Bearer ', '');
      if (token) {
        const decodedInfo = this.jwtService.decode(token.replace('Bearer ', ''));
        store.set('user', decodedInfo);
      }
      store.set('requestId', uuidv4());
      store.set('protocol', req.protocol);
      store.set('method', req.method);
      store.set('originalUrl', req.originalUrl);
      store.set('body', req.body);
      store.set('headers', req.headers);
      store.set('params', req.params);
    });

    res.on('close', () => {
      const durationInMilliseconds = getDurationInMilliseconds(start);
      const { statusCode } = res;
      const contentLength = res.get('content-length');

      loggerStorage.run(store, () => {
        store.set('contentLength', contentLength);
        store.set('statusCode', statusCode);
        store.set('duration', durationInMilliseconds);
        store.set('params', req.params);
      });

      this.logger.log(`${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`);
    });
  }
}
