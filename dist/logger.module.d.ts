import { DynamicModule, MiddlewareConsumer } from '@nestjs/common';
interface LoggerOptions {
    projectId: string;
    keyFilename: string;
    isGlobal: boolean;
}
export declare class WinstonLoggerModule {
    configure(consumer: MiddlewareConsumer): any;
    static forRoot(options: LoggerOptions): DynamicModule;
}
export {};
