const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();

function createExpenseStore(dbPath = path.join(__dirname, 'data', 'expenses.sqlite')) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        amount TEXT NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
  });

  function listExpenses() {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, title, amount, category, date FROM expenses ORDER BY date DESC, id DESC', (error, rows) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(rows);
      });
    });
  }

  function createExpense(expense) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO expenses (title, amount, category, date) VALUES (?, ?, ?, ?)',
        [expense.title, expense.amount, expense.category, expense.date],
        function (error) {
          if (error) {
            reject(error);
            return;
          }

          resolve({ id: this.lastID, ...expense });
        },
      );
    });
  }

  function updateExpense(id, expense) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE expenses SET title = ?, amount = ?, category = ?, date = ? WHERE id = ?',
        [expense.title, expense.amount, expense.category, expense.date, id],
        function (error) {
          if (error) {
            reject(error);
            return;
          }

          resolve({ id, ...expense });
        },
      );
    });
  }

  function deleteExpense(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM expenses WHERE id = ?', [id], function (error) {
        if (error) {
          reject(error);
          return;
        }

        resolve({ id });
      });
    });
  }

  function getSetting(key) {
    return new Promise((resolve, reject) => {
      db.get('SELECT value FROM settings WHERE key = ?', [key], (error, row) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(row ? row.value : null);
      });
    });
  }

  function setSetting(key, value) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        [key, value],
        function (error) {
          if (error) {
            reject(error);
            return;
          }

          resolve({ key, value });
        },
      );
    });
  }

  function close() {
    db.close();
  }

  return { listExpenses, createExpense, updateExpense, deleteExpense, getSetting, setSetting, close };
}

module.exports = { createExpenseStore };
