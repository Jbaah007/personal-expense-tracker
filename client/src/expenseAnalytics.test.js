import { describe, expect, it } from 'vitest'
import { getRecentExpenses, getSpendingTrend } from './expenseAnalytics'

describe('expenseAnalytics', () => {
  it('returns the most recent expenses first', () => {
    const expenses = [
      { id: 1, title: 'Coffee', amount: '4.50', category: 'Food', date: '2026-08-06' },
      { id: 2, title: 'Train', amount: '2.50', category: 'Transport', date: '2026-08-07' },
      { id: 3, title: 'Groceries', amount: '15.00', category: 'Food', date: '2026-08-08' },
    ]

    const recent = getRecentExpenses(expenses, 2)

    expect(recent.map((expense) => expense.id)).toEqual([3, 2])
  })

  it('groups monthly spending by day for a trend view', () => {
    const expenses = [
      { id: 1, title: 'Coffee', amount: '4.50', category: 'Food', date: '2026-08-06' },
      { id: 2, title: 'Train', amount: '2.50', category: 'Transport', date: '2026-08-06' },
      { id: 3, title: 'Groceries', amount: '15.00', category: 'Food', date: '2026-08-09' },
    ]

    const trend = getSpendingTrend(expenses, new Date('2026-08-15'))

    expect(trend).toEqual([
      { day: 6, amount: 7 },
      { day: 9, amount: 15 },
    ])
  })
})
