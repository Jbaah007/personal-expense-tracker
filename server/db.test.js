const test = require('node:test');
const assert = require('node:assert/strict');
const { createExpenseStore } = require('./db');

test('expense store accepts a PostgreSQL-style configuration object', () => {
  const store = createExpenseStore({
    databaseUrl: 'postgresql://postgres:postgres@localhost:5432/expense_tracker',
  });

  assert.equal(typeof store.listExpenses, 'function');
  assert.equal(typeof store.createExpense, 'function');
  assert.equal(typeof store.close, 'function');

  store.close();
});
