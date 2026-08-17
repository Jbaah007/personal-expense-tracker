const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const dbModulePath = path.resolve(__dirname, '../../server/db.js');
const getJsonBodyPath = path.resolve(__dirname, '../_lib/getJsonBody.js');
const handlerPath = path.resolve(__dirname, './[id].js');

function loadHandler({ updateExpense, deleteExpense, parsedBody = {} }) {
  delete require.cache[handlerPath];
  require.cache[dbModulePath] = {
    id: dbModulePath,
    filename: dbModulePath,
    loaded: true,
    exports: {
      createExpenseStore: () => ({
        updateExpense,
        deleteExpense,
      }),
    },
  };
  require.cache[getJsonBodyPath] = {
    id: getJsonBodyPath,
    filename: getJsonBodyPath,
    loaded: true,
    exports: async () => parsedBody,
  };

  return require(handlerPath);
}

function createResponse() {
  return {
    statusCode: 200,
    payload: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
  };
}

test('update handler falls back to id from URL path', async () => {
  const handler = loadHandler({
    parsedBody: { title: 'Lunch', amount: '12.00', category: 'Food', date: '2026-08-17' },
    updateExpense: async (id) => ({ id, title: 'Lunch', amount: '12.00', category: 'Food', date: '2026-08-17' }),
    deleteExpense: async () => ({ id: 1 }),
  });
  const res = createResponse();

  await handler({ method: 'PUT', url: '/api/expenses/42' }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.id, 42);
});

test('patch handler reads JSON from the request body and keeps the URL id', async () => {
  const handler = loadHandler({
    parsedBody: { title: 'Dinner', amount: '18.50', category: 'Food', date: '2026-08-17' },
    updateExpense: async (id, payload) => ({ id, title: payload.title, amount: payload.amount, category: payload.category, date: payload.date }),
    deleteExpense: async () => ({ id: 1 }),
  });
  const res = createResponse();

  await handler({ method: 'PATCH', url: '/api/expenses/24', body: { title: 'Dinner', amount: '18.50', category: 'Food', date: '2026-08-17' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.id, 24);
  assert.equal(res.payload.title, 'Dinner');
});

test('delete handler returns 400 when expense id is missing', async () => {
  const handler = loadHandler({
    updateExpense: async () => undefined,
    deleteExpense: async () => undefined,
  });
  const res = createResponse();

  await handler({ method: 'DELETE', url: '/api/expenses/' }, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.payload, { error: 'Expense id is required' });
});

test('delete handler returns 404 when the expense does not exist', async () => {
  const handler = loadHandler({
    updateExpense: async () => undefined,
    deleteExpense: async () => null,
  });
  const res = createResponse();

  await handler({ method: 'DELETE', query: { id: '99' }, url: '/api/expenses/99' }, res);

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.payload, { error: 'Expense not found' });
});
