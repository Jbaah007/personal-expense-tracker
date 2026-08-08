const { createExpenseStore } = require('../../server/db');
const getJsonBody = require('../../api/_lib/getJsonBody');

const store = createExpenseStore();

module.exports = async function handler(req, res) {
  try {
    const body = await getJsonBody(req);

    if (req.method === 'GET') {
      const budget = await store.getSetting('monthlyBudget');
      return res.status(200).json({ budget: budget ? Number(budget) : null });
    }

    if (req.method === 'PUT') {
      const budget = Number(body?.budget);
      if (!Number.isFinite(budget) || budget < 0) {
        return res.status(400).json({ error: 'Budget must be a non-negative number' });
      }

      const saved = await store.setSetting('monthlyBudget', String(budget));
      return res.status(200).json(saved);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to process budget request' });
  }
};
