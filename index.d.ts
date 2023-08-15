declare module 'nestjs-cloud-logging' {
  export const WinstonLogger: unique symbol;
  export const WinstonLoggerService: unique symbol;
  export const WinstonLoggerServiceApp: unique symbol;

  export interface WinstonLoggerModuleOptions {
    projectId: string;
    keyFilename: string;
    isGlobal?: boolean;
  }

  export class WinstonLoggerModule {
    static forRoot(options: WinstonLoggerModuleOptions): DynamicModule;
  }
}
