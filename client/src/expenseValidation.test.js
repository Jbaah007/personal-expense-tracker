import { describe, expect, it } from 'vitest'
import { validateExpenseInput } from './expenseValidation'

describe('validateExpenseInput', () => {
  it('accepts a valid expense', () => {
    const errors = validateExpenseInput({
      title: 'Coffee',
      amount: '4.50',
      category: 'Food',
      date: '2026-08-06',
    })

    expect(errors).toEqual({})
  })

  it('rejects missing fields', () => {
    const errors = validateExpenseInput({
      title: '',
      amount: '',
      category: '',
      date: '',
    })

    expect(errors).toMatchObject({
      title: 'Title must be at least 2 characters.',
      amount: 'Amount must be greater than 0.',
      category: 'Please choose a category.',
      date: 'Please select a date.',
    })
  })
})
