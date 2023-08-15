/// <reference types="node" />
import { AsyncLocalStorage } from 'async_hooks';
export declare const loggerStorage: AsyncLocalStorage<Map<any, any>>;
