import { AsyncLocalStorage } from 'async_hooks';

export const loggerStorage = new AsyncLocalStorage<Map<any, any>>();
