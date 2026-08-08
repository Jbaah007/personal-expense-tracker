const test = require('node:test');
const assert = require('node:assert/strict');
const getJsonBody = require('./getJsonBody');

test('parses a stringified JSON body without an async iterable request', async () => {
  const req = {
    method: 'POST',
    body: '{"title":"Test","amount":"1.23"}',
  };

  const parsed = await getJsonBody(req);

  assert.deepEqual(parsed, { title: 'Test', amount: '1.23' });
});

test('returns an empty object for GET requests when no body is present', async () => {
  const req = {
    method: 'GET',
    body: undefined,
  };

  const parsed = await getJsonBody(req);

  assert.deepEqual(parsed, {});
});
