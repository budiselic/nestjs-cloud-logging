const assert = require('node:assert/strict');
const { it } = require('node:test');
const { getDurationInMilliseconds } = require('../dist');

it('getDurationInMilliseconds returns a positive elapsed duration', async () => {
  const start = process.hrtime();
  await Promise.resolve();

  const duration = getDurationInMilliseconds(start);

  assert.equal(Number.isFinite(duration), true);
  assert.equal(duration >= 0, true);
});
