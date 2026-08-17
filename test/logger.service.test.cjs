require('reflect-metadata');

const assert = require('node:assert/strict');
const { after, before, describe, it } = require('node:test');
const { ConsoleLogger } = require('@nestjs/common');
const { LoggerService, loggerStorage } = require('../dist');

const consoleMethods = ['log', 'error', 'warn', 'debug', 'verbose', 'fatal'];
const originalConsoleMethods = new Map();

const createWinstonLogger = () => {
  const calls = [];
  const logger = {};

  for (const level of ['info', 'error', 'warn', 'debug', 'verbose']) {
    logger[level] = (message, metadata) => {
      calls.push({ level, message, metadata });
    };
  }

  return { calls, logger };
};

before(() => {
  for (const method of consoleMethods) {
    originalConsoleMethods.set(method, ConsoleLogger.prototype[method]);
    ConsoleLogger.prototype[method] = () => undefined;
  }
});

after(() => {
  for (const [method, implementation] of originalConsoleMethods) {
    ConsoleLogger.prototype[method] = implementation;
  }
});

describe('LoggerService', () => {
  it('forwards every Nest log level to Winston with stable metadata', () => {
    const { calls, logger } = createWinstonLogger();
    const service = new LoggerService(logger, 'UsersService');

    service.log('log message');
    service.warn('warn message', 'CustomContext');
    service.debug('debug message');
    service.verbose('verbose message');
    service.fatal('fatal message');

    assert.deepEqual(
      calls.map(({ level }) => level),
      ['info', 'warn', 'debug', 'verbose', 'error'],
    );
    assert.equal(calls[0].metadata.context, 'UsersService');
    assert.equal(calls[1].metadata.context, 'CustomContext');
    assert.equal(calls[4].metadata.nestLevel, 'fatal');
    assert.match(calls[0].metadata.loggerInstanceId, /^[a-f0-9]{8}$/);
    assert.equal(
      new Set(calls.map(({ metadata }) => metadata.loggerInstanceId)).size,
      1,
    );
  });

  it('preserves an error stack and explicit context', () => {
    const { calls, logger } = createWinstonLogger();
    const service = new LoggerService(logger, 'DefaultContext');
    const stack = 'Error: failure\n    at handler (/app/index.js:10:4)';

    service.error('failure', stack, 'JobsService');

    assert.equal(calls[0].level, 'error');
    assert.equal(calls[0].metadata.stack, stack);
    assert.equal(calls[0].metadata.context, 'JobsService');
  });

  it('does not leak request metadata into later log calls', () => {
    const { calls, logger } = createWinstonLogger();
    const service = new LoggerService(logger, 'OrdersService');

    loggerStorage.run(new Map([['requestId', 'request-1']]), () => {
      service.log('inside request');
    });
    service.log('outside request');

    assert.equal(calls[0].metadata.requestId, 'request-1');
    assert.equal('requestId' in calls[1].metadata, false);
    assert.equal(calls[0].metadata.requestId, 'request-1');
  });

  it('serializes non-string messages and protects logger-owned metadata', () => {
    const { calls, logger } = createWinstonLogger();
    const service = new LoggerService(logger, 'PaymentsService');

    loggerStorage.run(
      new Map([
        ['loggerInstanceId', 'spoofed'],
        ['context', 'spoofed'],
      ]),
      () => service.log({ amount: 42n }),
    );

    assert.equal(calls[0].message, '{"amount":"42"}');
    assert.notEqual(calls[0].metadata.loggerInstanceId, 'spoofed');
    assert.equal(calls[0].metadata.context, 'PaymentsService');
  });

  it('honors ConsoleLogger level filtering for cloud logs', () => {
    const { calls, logger } = createWinstonLogger();
    const service = new LoggerService(logger, 'FilteredService');
    service.setLogLevels(['error']);

    service.log('ignored');
    service.error('kept');

    assert.equal(calls.length, 1);
    assert.equal(calls[0].message, 'kept');
  });
});
