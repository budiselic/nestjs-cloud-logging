import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LoggerService } from './logger.service';
import { JwtService } from '@nestjs/jwt';
export declare class HttpMiddleware implements NestMiddleware {
    private readonly logger;
    private readonly jwtService;
    constructor(logger: LoggerService, jwtService: JwtService);
    use(req: Request, res: Response, next: NextFunction): void;
}
