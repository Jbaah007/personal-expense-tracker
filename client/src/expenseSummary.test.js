import { describe, expect, it } from 'vitest'
import { getMonthSummary } from './expenseSummary'

describe('getMonthSummary', () => {
  it('calculates the monthly total and category totals', () => {
    const summary = getMonthSummary(
      [
        { title: 'Coffee', amount: '4.50', category: 'Food', date: '2026-08-06' },
        { title: 'Train', amount: '2.50', category: 'Transport', date: '2026-08-09' },
        { title: 'Groceries', amount: '15.00', category: 'Food', date: '2025-08-01' },
      ],
      new Date('2026-08-15'),
    )

    expect(summary.total).toBe('7.00')
    expect(summary.byCategory).toEqual({
      Food: 4.5,
      Transport: 2.5,
    })
    expect(summary.categoryEntries).toEqual([
      ['Food', 4.5],
      ['Transport', 2.5],
    ])
    expect(summary.maxCategoryAmount).toBe(4.5)
  })
})
