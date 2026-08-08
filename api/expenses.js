const { createExpenseStore } = require('../server/db');
const getJsonBody = require('./_lib/getJsonBody');

const store = createExpenseStore();

module.exports = async function handler(req, res) {
  try {
    const body = await getJsonBody(req);

    if (req.method === 'GET') {
      const expenses = await store.listExpenses();
      return res.status(200).json(expenses);
    }

    if (req.method === 'POST') {
      const expense = await store.createExpense(body || {});
      return res.status(201).json(expense);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to process expense request' });
  }
};
