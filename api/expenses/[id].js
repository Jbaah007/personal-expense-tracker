const { createExpenseStore } = require('../../server/db');
const getJsonBody = require('../../api/_lib/getJsonBody');

const store = createExpenseStore();

module.exports = async function handler(req, res) {
  const id = Number(req.query.id || req.query['id'] || req.body?.id);

  try {
    const body = await getJsonBody(req);

    if (req.method === 'PUT') {
      const expense = await store.updateExpense(id, body || {});
      return res.status(200).json(expense);
    }

    if (req.method === 'DELETE') {
      const expense = await store.deleteExpense(id);
      return res.status(200).json(expense);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to update expense' });
  }
};
