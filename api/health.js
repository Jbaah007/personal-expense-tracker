const { createExpenseStore } = require('../server/db');

module.exports = async function handler(req, res) {
  res.status(200).json({ status: 'ok', message: 'Expense tracker backend is running' });
};
