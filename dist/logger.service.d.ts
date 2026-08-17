import { ConsoleLogger } from '@nestjs/common';
import type { Logger as WinstonLogger } from 'winston';
export declare class LoggerService extends ConsoleLogger {
    private readonly logger;
    private readonly loggerInstanceId;
    constructor(logger: WinstonLogger, context?: string);
    error(message: unknown, ...optionalParams: unknown[]): void;
    log(message: unknown, ...optionalParams: unknown[]): void;
    debug(message: unknown, ...optionalParams: unknown[]): void;
    warn(message: unknown, ...optionalParams: unknown[]): void;
    verbose(message: unknown, ...optionalParams: unknown[]): void;
    fatal(message: unknown, ...optionalParams: unknown[]): void;
    private getContext;
    private serializeMessage;
    private getErrorContextAndStack;
    private isStack;
    private getMetadata;
}
