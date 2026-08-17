require('reflect-metadata');

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const { SELF_DECLARED_DEPS_METADATA } = require('@nestjs/common/constants');
const {
  Logger,
  WinstonLogger,
  WinstonLoggerModule,
  WinstonLoggerOptions,
  WinstonLoggerService,
  WinstonLoggerServiceApp,
} = require('../dist');

describe('WinstonLoggerModule', () => {
  it('provides secure defaults and the documented public tokens', () => {
    const options = {
      defaultMeta: { service: 'api' },
      isGlobal: true,
      level: 'info',
      projectId: 'project-id',
    };
    const module = WinstonLoggerModule.forRoot(options);

    assert.equal(module.global, true);
    assert.deepEqual(module.exports, [
      WinstonLoggerService,
      WinstonLoggerServiceApp,
    ]);
    assert.equal(
      module.providers.find(({ provide }) => provide === WinstonLoggerOptions)
        .useValue,
      options,
    );
    assert.equal(
      typeof module.providers.find(({ provide }) => provide === WinstonLogger)
        .useFactory,
      'function',
    );
  });

  it('can disable automatic HTTP middleware registration', () => {
    let applyCalls = 0;
    const consumer = {
      apply() {
        applyCalls += 1;
        return { forRoutes() {} };
      },
    };

    new WinstonLoggerModule({ http: false }).configure(consumer);
    assert.equal(applyCalls, 0);

    new WinstonLoggerModule({}).configure(consumer);
    assert.equal(applyCalls, 1);
  });

  it('Logger decorator injects the transient logger token', () => {
    class Consumer {}

    Logger()(Consumer, undefined, 0);

    const dependencies = Reflect.getMetadata(
      SELF_DECLARED_DEPS_METADATA,
      Consumer,
    );
    assert.equal(dependencies[0].index, 0);
    assert.equal(dependencies[0].param, WinstonLoggerService);
  });
});
