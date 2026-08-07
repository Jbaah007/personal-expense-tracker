import { describe, expect, it } from 'vitest'
import { getFilteredExpenses } from './expenseFilters'

describe('getFilteredExpenses', () => {
  it('filters by search and category and applies sorting', () => {
    const expenses = [
      { id: 1, title: 'Coffee', amount: '4.50', category: 'Food', date: '2026-08-06' },
      { id: 2, title: 'Bus pass', amount: '10.00', category: 'Transport', date: '2026-08-08' },
      { id: 3, title: 'Groceries', amount: '15.00', category: 'Food', date: '2026-08-03' },
    ]

    const result = getFilteredExpenses(expenses, 'co', 'Food', 'amount', 'asc')

    expect(result).toEqual([
      { id: 1, title: 'Coffee', amount: '4.50', category: 'Food', date: '2026-08-06' },
    ])
  })
})
