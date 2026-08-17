import { NestMiddleware } from '@nestjs/common';
import type { IncomingHttpHeaders } from 'http';
import { LoggerService } from './logger.service';
import type { WinstonLoggerModuleOptions } from './logger.interfaces';
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
export declare class HttpMiddleware implements NestMiddleware {
    private readonly logger;
    private readonly loggerOptions;
    constructor(logger: LoggerService, loggerOptions: WinstonLoggerModuleOptions);
    use(req: HttpRequest, res: HttpResponse, next: NextFunction): void;
}
export {};
