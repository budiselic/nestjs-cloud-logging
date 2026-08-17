import { AsyncLocalStorage } from 'async_hooks';
export type LoggerStore = Map<string, unknown>;
export declare const loggerStorage: AsyncLocalStorage<LoggerStore>;
