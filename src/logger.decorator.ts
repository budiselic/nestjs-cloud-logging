import { Inject } from '@nestjs/common';
import { WinstonLoggerService } from './logger.constants';

/**
 * Injects a transient cloud logger whose context is the consuming class.
 * @param _name Kept for backward compatibility. Context names should be passed
 * to a log method or configured with `setContext()`.
 */
export function Logger(_name?: string): ReturnType<typeof Inject> {
  return Inject(WinstonLoggerService);
}
