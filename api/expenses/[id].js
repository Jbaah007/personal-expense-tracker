const { createExpenseStore } = require('../../server/db');
const getJsonBody = require('../../api/_lib/getJsonBody');

const store = createExpenseStore();

function getExpenseId(req, body = {}) {
  const queryId = req?.query?.id;
  const fallbackId = body?.id;
  const rawUrl = typeof req?.url === 'string' ? req.url : '';
  const pathname = rawUrl.split('?')[0] || req?.originalUrl || '/';
  const pathId = pathname.split('/').filter(Boolean).at(-1);

  const rawId = Array.isArray(queryId)
    ? queryId[0]
    : queryId || fallbackId || pathId;

  const id = Number(rawId);

  return Number.isInteger(id) && id > 0 ? id : null;
}

module.exports = async function handler(req, res) {
  try {
    const body = await getJsonBody(req);
    const id = getExpenseId(req, body);

    if (!id) {
      return res.status(400).json({ error: 'Expense id is required' });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const expense = await store.updateExpense(id, body || {});

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      return res.status(200).json(expense);
    }

    if (req.method === 'DELETE') {
      const expense = await store.deleteExpense(id);

      if (!expense || Number(expense.id) !== Number(id)) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      return res.status(200).json(expense);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to process expense request' });
  }
};
