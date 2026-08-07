const express = require('express');
const cors = require('cors');
const { createExpenseStore } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const store = createExpenseStore();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Expense tracker backend is running' });
});

app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await store.listExpenses();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load expenses' });
  }
});

app.get('/api/settings/budget', async (req, res) => {
  try {
    const budget = await store.getSetting('monthlyBudget');
    res.json({ budget: budget ? Number(budget) : null });
  } catch (error) {
    res.status(500).json({ error: 'Unable to load budget' });
  }
});

app.put('/api/settings/budget', async (req, res) => {
  try {
    const budget = Number(req.body.budget);
    if (!Number.isFinite(budget) || budget < 0) {
      return res.status(400).json({ error: 'Budget must be a non-negative number' });
    }

    const saved = await store.setSetting('monthlyBudget', String(budget));
    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Unable to save budget' });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const expense = await store.createExpense(req.body);
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Unable to create expense' });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  try {
    const expense = await store.updateExpense(Number(req.params.id), req.body);
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Unable to update expense' });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const expense = await store.deleteExpense(Number(req.params.id));
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete expense' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
