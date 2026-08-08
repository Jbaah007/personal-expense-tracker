function parseDateParts(dateValue) {
  const [year, month, day] = String(dateValue).split('-').map(Number)
  return { year, month: month - 1, day }
}

export function getRecentExpenses(expenses = [], count = 5) {
  return [...(Array.isArray(expenses) ? expenses : [])]
    .sort((left, right) => {
      const leftDate = parseDateParts(left.date)
      const rightDate = parseDateParts(right.date)
      const leftTimestamp = Date.UTC(leftDate.year, leftDate.month, leftDate.day)
      const rightTimestamp = Date.UTC(rightDate.year, rightDate.month, rightDate.day)
      return rightTimestamp - leftTimestamp
    })
    .slice(0, count)
}

export function getSpendingTrend(expenses = [], referenceDate = new Date()) {
  const currentYear = referenceDate.getFullYear()
  const currentMonth = referenceDate.getMonth()

  const entries = (Array.isArray(expenses) ? expenses : [])
    .filter((expense) => {
      const { year, month } = parseDateParts(expense.date)
      return year === currentYear && month === currentMonth
    })
    .reduce((accumulator, expense) => {
      const { day } = parseDateParts(expense.date)
      const key = day
      accumulator[key] = (accumulator[key] || 0) + Number(expense.amount || 0)
      return accumulator
    }, {})

  return Object.entries(entries)
    .map(([day, amount]) => ({ day: Number(day), amount }))
    .sort((left, right) => left.day - right.day)
}
