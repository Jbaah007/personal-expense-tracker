import { useEffect, useState } from 'react'
import './App.css'
import { validateExpenseInput } from './expenseValidation'
import { getMonthSummary } from './expenseSummary'
import { getFilteredExpenses } from './expenseFilters'
import { getCategoryBadge } from './categoryStyles'
import { getRecentExpenses, getSpendingTrend } from './expenseAnalytics'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const initialFormState = {
  title: '',
  amount: '',
  category: '',
  date: '',
}

function App() {
  const [status, setStatus] = useState('Checking backend...')
  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [expenses, setExpenses] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortKey, setSortKey] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [budget, setBudget] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const summary = getMonthSummary(expenses)
  const recentExpenses = getRecentExpenses(expenses, 5)
  const spendingTrend = getSpendingTrend(expenses)
  const filteredExpenses = getFilteredExpenses(
    expenses,
    searchTerm,
    categoryFilter,
    sortKey,
    sortOrder,
  )

  function loadExpenses() {
    fetch(`${API_BASE_URL}/api/expenses`)
      .then((response) => response.json())
      .then((data) => setExpenses(data))
      .catch(() => setExpenses([]))
  }

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`)
      .then((response) => response.json())
      .then((data) => setStatus(data.message))
      .catch(() => setStatus('Backend not reachable yet'))

    loadExpenses()

    fetch(`${API_BASE_URL}/api/settings/budget`)
      .then((response) => response.json())
      .then((data) => {
        if (data.budget !== null && data.budget !== undefined) {
          setBudget(String(data.budget))
        }
      })
      .catch(() => setBudget(''))
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  async function handleBudgetSave(event) {
    event.preventDefault()

    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/budget`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ budget: Number(budget) }),
      })

      if (!response.ok) {
        throw new Error('Unable to save budget')
      }

      const data = await response.json()
      setBudget(String(data.value))
      setErrors({})
    } catch (error) {
      setErrors({ budget: error.message || 'Unable to save budget right now.' })
    }
  }

  function handleExport() {
    const rows = [
      ['Title', 'Amount', 'Category', 'Date'],
      ...expenses.map((expense) => [expense.title, expense.amount, expense.category, expense.date]),
    ]

    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'expenses.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateExpenseInput(formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      const requestOptions = {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount).toFixed(2),
        }),
      }

      const url = editingId
        ? `${API_BASE_URL}/api/expenses/${editingId}`
        : `${API_BASE_URL}/api/expenses`

      const response = await fetch(url, requestOptions)

      if (!response.ok) {
        throw new Error('Unable to save expense')
      }

      const savedExpense = await response.json()

      if (editingId) {
        loadExpenses()
      } else {
        loadExpenses()
      }

      setFormData(initialFormState)
      setEditingId(null)
      setErrors({})
    } catch (error) {
      setErrors({ submit: error.message || 'Unable to save expense right now.' })
    }
  }

  function handleEdit(expense) {
    setEditingId(expense.id)
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
    })
    setErrors({})
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this expense?')
    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Unable to delete expense')
      }

      loadExpenses()
      if (editingId === id) {
        setEditingId(null)
        setFormData(initialFormState)
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Unable to delete expense right now.' })
    }
  }

  return (
    <main className={`app-shell ${darkMode ? 'dark' : ''}`}>
      <section className="hero-card hero-spotlight">
        <div className="hero-copy">
          <p className="eyebrow">Personal finance, simplified</p>
          <h1>Stay on top of every expense.</h1>
          <p className="intro">
            Capture spending, review your monthly patterns, and keep your budget under control from one clean dashboard.
          </p>
        </div>
        <div className="hero-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setDarkMode((current) => !current)}
          >
            {darkMode ? '☀️ Light mode' : '🌙 Dark mode'}
          </button>
        </div>
      </section>

      <section className="summary-grid">
        <article className="summary-card accent-card">
          <h2>This month</h2>
          <p className="summary-total">${summary.total}</p>
          <p className="summary-caption">Total spent across current month expenses.</p>
          <form className="budget-form" onSubmit={handleBudgetSave}>
            <label className="budget-label" htmlFor="budget-input">
              Monthly budget
            </label>
            <div className="budget-row">
              <input
                id="budget-input"
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                placeholder="Enter budget"
              />
              <button type="submit" className="secondary-button">
                Save
              </button>
            </div>
            {errors.budget && <span className="error-text">{errors.budget}</span>}
          </form>
          <p className="budget-status">
            {Number(summary.total) > Number(budget || 0)
              ? `You are over budget by $${(Number(summary.total) - Number(budget || 0)).toFixed(2)}.`
              : `You have $${(Number(budget || 0) - Number(summary.total)).toFixed(2)} left.`}
          </p>
        </article>

        <article className="summary-card">
          <div className="summary-card-header">
            <h2>Monthly spending</h2>
            <span className="pill">Live</span>
          </div>
          <p className="summary-caption">A quick look at this month’s category breakdown.</p>
          <div className="chart-list">
            {summary.categoryEntries.length === 0 ? (
              <p className="empty-state">No expenses logged for this month yet.</p>
            ) : (
              summary.categoryEntries.map(([category, amount]) => {
                const width = Math.max((amount / summary.maxCategoryAmount) * 100, 8)
                return (
                  <div key={category} className="chart-row">
                    <div className="chart-labels">
                      <span>{category}</span>
                      <span>${amount.toFixed(2)}</span>
                    </div>
                    <div className="chart-bar-track">
                      <div className="chart-bar" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </article>
      </section>

      <section className="content-grid">
        <form className="form-card" onSubmit={handleSubmit} noValidate>
          <h2>Add an expense</h2>

          <label>
            Title
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Coffee"
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </label>

          <label>
            Amount
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={handleChange}
              placeholder="4.50"
            />
            {errors.amount && <span className="error-text">{errors.amount}</span>}
          </label>

          <label>
            Category
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="">Select a category</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && <span className="error-text">{errors.category}</span>}
          </label>

          <label>
            Date
            <input name="date" type="date" value={formData.date} onChange={handleChange} />
            {errors.date && <span className="error-text">{errors.date}</span>}
          </label>

          {errors.submit && <p className="error-text">{errors.submit}</p>}
          <button type="submit">{editingId ? 'Update expense' : 'Save expense'}</button>
          {editingId && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setEditingId(null)
                setFormData(initialFormState)
                setErrors({})
              }}
            >
              Cancel edit
            </button>
          )}
        </form>

        <section className="table-card">
          <div className="table-card-header">
            <h2>Expenses</h2>
            <button type="button" className="table-button export-button" onClick={handleExport}>
              Export CSV
            </button>
          </div>
          <div className="toolbar">
            <input
              className="toolbar-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by title"
            />
            <select
              className="toolbar-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">All categories</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Other">Other</option>
            </select>
            <select
              className="toolbar-select"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value)}
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="title">Title</option>
            </select>
            <select
              className="toolbar-select"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <div className="insights-grid">
            <div className="insight-panel">
              <h3>Recent activity</h3>
              <ul>
                {recentExpenses.length === 0 ? (
                  <li className="empty-state">No recent expenses yet.</li>
                ) : (
                  recentExpenses.map((expense) => (
                    <li key={expense.id}>
                      <span>{expense.title}</span>
                      <strong>${expense.amount}</strong>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="insight-panel">
              <h3>Spending trend</h3>
              <div className="trend-list">
                {spendingTrend.length === 0 ? (
                  <p className="empty-state">No spending trend yet.</p>
                ) : (
                  spendingTrend.map((item) => (
                    <div key={item.day} className="trend-item">
                      <span>Day {item.day}</span>
                      <strong>${item.amount.toFixed(2)}</strong>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          {filteredExpenses.length === 0 ? (
            <p className="empty-state">No expenses found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.title}</td>
                    <td>${expense.amount}</td>
                    <td>
                      <span className={getCategoryBadge(expense.category).className}>
                        {getCategoryBadge(expense.category).label}
                      </span>
                    </td>
                    <td>{expense.date}</td>
                    <td>
                      <button type="button" className="table-button" onClick={() => handleEdit(expense)}>
                        Edit
                      </button>
                      <button type="button" className="table-button danger" onClick={() => handleDelete(expense.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
