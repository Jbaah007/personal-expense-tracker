const test = require('node:test');
const assert = require('node:assert/strict');
const { createExpenseStore, resolveDatabaseUrl } = require('./db');

test('createExpenseStore is available for PostgreSQL-backed apps', () => {
  assert.equal(typeof createExpenseStore, 'function');
});

test('resolveDatabaseUrl prefers Neon/Vercel-style environment variables', () => {
  const resolved = resolveDatabaseUrl({}, {
    POSTGRES_URL: 'postgresql://postgres:postgres@localhost:5432/expense_tracker',
  });

  assert.equal(resolved, 'postgresql://postgres:postgres@localhost:5432/expense_tracker');
});
