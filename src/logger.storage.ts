import { AsyncLocalStorage } from 'async_hooks';

export type LoggerStore = Map<string, unknown>;

export const loggerStorage = new AsyncLocalStorage<LoggerStore>();
