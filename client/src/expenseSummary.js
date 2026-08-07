function parseDateParts(dateValue) {
  const [year, month, day] = String(dateValue).split('-').map(Number)
  return { year, month: month - 1, day }
}

export function getMonthSummary(expenses, referenceDate = new Date()) {
  const currentYear = referenceDate.getFullYear()
  const currentMonth = referenceDate.getMonth()

  const monthlyExpenses = expenses.filter((expense) => {
    const { year, month } = parseDateParts(expense.date)
    return year === currentYear && month === currentMonth
  })

  const total = monthlyExpenses.reduce((sum, expense) => {
    return sum + Number(expense.amount || 0)
  }, 0)

  const byCategory = monthlyExpenses.reduce((accumulator, expense) => {
    const category = expense.category || 'Other'
    accumulator[category] = (accumulator[category] || 0) + Number(expense.amount || 0)
    return accumulator
  }, {})

  const categoryEntries = Object.entries(byCategory).sort((left, right) => right[1] - left[1])
  const maxCategoryAmount = Math.max(...categoryEntries.map(([, amount]) => amount), 1)

  return {
    total: total.toFixed(2),
    monthlyExpenses,
    byCategory,
    categoryEntries,
    maxCategoryAmount,
  }
}
