import { Inject } from '@nestjs/common';
import { Constructor } from 'type-fest';
import { WinstonLoggerService } from './logger.constants';

export function Logger(name?: string): ReturnType<typeof Inject> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return (target: Constructor<unknown>, key: string | symbol, index?: number) => {
    name = name || target.constructor.name;
    Inject(WinstonLoggerService)(target, key, index);
  };
}
