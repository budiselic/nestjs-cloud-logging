import { ConsoleLogger } from '@nestjs/common';
import winston from 'winston';
export declare class LoggerService extends ConsoleLogger {
    private readonly logger?;
    private inquirer?;
    private store;
    private metadata;
    private meta;
    constructor(logger?: winston.Logger, inquirer?: string);
    error(message: any, stack?: string, context?: string): void;
    log(message: any, context?: string): void;
    debug(message: any, context?: string): void;
    warn(message: any, context?: string): void;
    verbose(message: any, context?: string): void;
}
