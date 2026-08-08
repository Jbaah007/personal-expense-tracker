const path = require('node:path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function resolveDatabaseUrl(config = {}, env = process.env) {
  if (config.databaseUrl) {
    return config.databaseUrl;
  }

  return (
    env.DATABASE_URL ||
    env.POSTGRES_URL ||
    env.POSTGRES_PRISMA_URL ||
    env.POSTGRES_URL_NON_POOLING ||
    env.NEON_DATABASE_URL ||
    null
  );
}

function createExpenseStore(config = {}) {
  const databaseUrl = resolveDatabaseUrl(config);
  const useSsl = Boolean(databaseUrl && /render\.com|neon\.tech/i.test(databaseUrl));

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  });

  const initializationPromise = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        amount TEXT NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
  })().catch((error) => {
    console.error('Database initialization failed:', error.message);
    console.error('Set DATABASE_URL to a valid PostgreSQL connection string before starting the server.');
    throw error;
  });

  async function ensureInitialized() {
    await initializationPromise;
  }

  async function listExpenses() {
    await ensureInitialized();
    const result = await pool.query(
      'SELECT id, title, amount, category, date FROM expenses ORDER BY date DESC, id DESC',
    );
    return result.rows;
  }

  async function createExpense(expense) {
    await ensureInitialized();
    const result = await pool.query(
      'INSERT INTO expenses (title, amount, category, date) VALUES ($1, $2, $3, $4) RETURNING id, title, amount, category, date',
      [expense.title, expense.amount, expense.category, expense.date],
    );

    return result.rows[0];
  }

  async function updateExpense(id, expense) {
    await ensureInitialized();
    const result = await pool.query(
      'UPDATE expenses SET title = $1, amount = $2, category = $3, date = $4 WHERE id = $5 RETURNING id, title, amount, category, date',
      [expense.title, expense.amount, expense.category, expense.date, id],
    );

    return result.rows[0];
  }

  async function deleteExpense(id) {
    await ensureInitialized();
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || { id };
  }

  async function getSetting(key) {
    await ensureInitialized();
    const result = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
    return result.rows[0] ? result.rows[0].value : null;
  }

  async function setSetting(key, value) {
    await ensureInitialized();
    const result = await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value RETURNING key, value',
      [key, value],
    );

    return result.rows[0];
  }

  async function close() {
    await pool.end();
  }

  return { listExpenses, createExpense, updateExpense, deleteExpense, getSetting, setSetting, close };
}

module.exports = { createExpenseStore, resolveDatabaseUrl };
