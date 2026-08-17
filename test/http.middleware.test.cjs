require('reflect-metadata');

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { describe, it } = require('node:test');
const { HttpMiddleware, loggerStorage } = require('../dist');

const createRequest = (overrides = {}) => {
  const headers = overrides.headers || {};

  return {
    body: { email: 'person@example.com', password: 'secret' },
    get(name) {
      const value = headers[name.toLowerCase()];
      return Array.isArray(value) ? value[0] : value;
    },
    headers,
    ip: '127.0.0.1',
    method: 'POST',
    originalUrl: '/users/42',
    params: { id: '42' },
    protocol: 'https',
    ...overrides,
    headers,
  };
};

class FakeResponse extends EventEmitter {
  constructor() {
    super();
    this.statusCode = 201;
    this.writableFinished = false;
    this.headers = { 'content-length': '123' };
  }

  get(name) {
    return this.headers[name.toLowerCase()];
  }
}

const createLogger = () => {
  const calls = [];

  return {
    calls,
    logger: {
      log(message) {
        calls.push({
          message,
          store: new Map(loggerStorage.getStore()),
        });
      },
    },
  };
};

const createJwt = (payload) =>
  [
    Buffer.from('{}').toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

describe('HttpMiddleware', () => {
  it('makes sanitized request metadata available before calling next', () => {
    const token = createJwt({ sub: 'user-1', role: 'admin' });
    const request = createRequest({
      body: {
        email: 'person@example.com',
        password: 'secret',
        profile: { ssn: '123-45-6789' },
      },
      headers: {
        authorization: `Bearer ${token}`,
        cookie: 'session=secret',
        'x-request-id': 'request-from-upstream',
        'x-secret-header': 'secret',
      },
    });
    const response = new FakeResponse();
    const { calls, logger } = createLogger();
    const middleware = new HttpMiddleware(logger, {
      http: {
        redactFields: ['ssn'],
        redactHeaders: ['x-secret-header'],
      },
    });
    let requestStore;

    middleware.use(request, response, () => {
      requestStore = new Map(loggerStorage.getStore());
    });

    assert.equal(requestStore.get('requestId'), 'request-from-upstream');
    assert.deepEqual(requestStore.get('user'), {
      sub: 'user-1',
      role: 'admin',
    });
    assert.equal(requestStore.get('headers').authorization, '[REDACTED]');
    assert.equal(requestStore.get('headers').cookie, '[REDACTED]');
    assert.equal(requestStore.get('headers')['x-secret-header'], '[REDACTED]');
    assert.equal(requestStore.get('body').password, '[REDACTED]');
    assert.equal(requestStore.get('body').profile.ssn, '[REDACTED]');

    response.writableFinished = true;
    response.emit('finish');
    response.emit('close');

    assert.equal(calls.length, 1);
    assert.match(calls[0].message, /^POST \/users\/42 201 123/);
    assert.equal(calls[0].store.get('statusCode'), 201);
    assert.equal(calls[0].store.get('contentLength'), '123');
    assert.equal(typeof calls[0].store.get('duration'), 'number');
    assert.equal(calls[0].store.has('aborted'), false);
  });

  it('logs an aborted response once from the request context', () => {
    const request = createRequest();
    const response = new FakeResponse();
    const { calls, logger } = createLogger();
    const middleware = new HttpMiddleware(logger, {});

    middleware.use(request, response, () => undefined);
    response.emit('close');
    response.emit('close');

    assert.equal(calls.length, 1);
    assert.equal(calls[0].store.get('aborted'), true);
    assert.match(calls[0].store.get('requestId'), /^[a-f0-9-]{36}$/);
  });

  it('allows sensitive request metadata capture to be disabled', () => {
    const request = createRequest({
      headers: { authorization: 'Bearer malformed-token' },
    });
    const response = new FakeResponse();
    const { logger } = createLogger();
    const middleware = new HttpMiddleware(logger, {
      http: {
        captureBody: false,
        captureHeaders: false,
        captureUser: false,
      },
    });
    let requestStore;

    middleware.use(request, response, () => {
      requestStore = loggerStorage.getStore();
    });

    assert.equal(requestStore.has('body'), false);
    assert.equal(requestStore.has('headers'), false);
    assert.equal(requestStore.has('user'), false);
  });
});
