export function getFilteredExpenses(expenses = [], searchTerm, categoryFilter, sortKey, sortOrder) {
  return (Array.isArray(expenses) ? expenses : [])
    .filter((expense) => {
      const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((left, right) => {
      const leftValue = left[sortKey]
      const rightValue = right[sortKey]

      if (sortKey === 'amount') {
        const comparison = Number(leftValue) - Number(rightValue)
        return sortOrder === 'asc' ? comparison : -comparison
      }

      const comparison = String(leftValue).localeCompare(String(rightValue))
      return sortOrder === 'asc' ? comparison : -comparison
    })
}
