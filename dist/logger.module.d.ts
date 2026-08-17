import { DynamicModule, MiddlewareConsumer } from '@nestjs/common';
import type { WinstonLoggerModuleOptions } from './logger.interfaces';
export declare class WinstonLoggerModule {
    private readonly options;
    constructor(options: WinstonLoggerModuleOptions);
    configure(consumer: MiddlewareConsumer): void;
    static forRoot(options?: WinstonLoggerModuleOptions): DynamicModule;
}
