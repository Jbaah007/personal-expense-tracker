const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createExpenseStore } = require('./db');

test('expense store saves, updates, and deletes expenses', async () => {
  const dbPath = path.join(__dirname, 'data', 'test-expenses.sqlite');

  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const store = createExpenseStore(dbPath);
  const created = await store.createExpense({
    title: 'Coffee',
    amount: '4.50',
    category: 'Food',
    date: '2026-08-06',
  });

  const updated = await store.updateExpense(created.id, {
    title: 'Tea',
    amount: '3.20',
    category: 'Food',
    date: '2026-08-07',
  });

  const updatedExpenses = await store.listExpenses();
  assert.equal(updatedExpenses.length, 1);
  assert.equal(updatedExpenses[0].title, 'Tea');
  assert.equal(updated.amount, '3.20');

  const deleted = await store.deleteExpense(created.id);
  const remainingExpenses = await store.listExpenses();

  assert.equal(deleted.id, created.id);
  assert.equal(remainingExpenses.length, 0);

  store.close();
});
