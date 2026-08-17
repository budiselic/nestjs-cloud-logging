require('reflect-metadata');

const assert = require('node:assert/strict');
const { it } = require('node:test');
const { Injectable, Module } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const {
  Logger,
  LoggerService,
  WinstonLoggerModule,
  WinstonLoggerServiceApp,
} = require('../dist');

it('resolves application and contextual loggers through Nest DI', async () => {
  class Consumer {
    constructor(logger) {
      this.logger = logger;
    }
  }

  Injectable()(Consumer);
  Logger()(Consumer, undefined, 0);

  class TestModule {}

  Module({
    imports: [
      WinstonLoggerModule.forRoot({
        http: false,
        transportOptions: { redirectToStdout: true },
      }),
    ],
    providers: [Consumer],
  })(TestModule);

  const app = await NestFactory.createApplicationContext(TestModule, {
    logger: false,
  });

  try {
    const applicationLogger = app.get(WinstonLoggerServiceApp);
    const consumer = app.get(Consumer);

    assert.equal(applicationLogger instanceof LoggerService, true);
    assert.equal(consumer.logger instanceof LoggerService, true);
    assert.equal(applicationLogger.context, 'Application');
    assert.equal(consumer.logger.context, 'Consumer');
  } finally {
    await app.close();
  }
});
