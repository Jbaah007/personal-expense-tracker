const categoryAccentMap = {
  Food: { label: 'Food', className: 'category-badge food' },
  Transport: { label: 'Transport', className: 'category-badge transport' },
  Shopping: { label: 'Shopping', className: 'category-badge shopping' },
  Bills: { label: 'Bills', className: 'category-badge bills' },
  Other: { label: 'Other', className: 'category-badge other' },
}

export function getCategoryBadge(category) {
  return categoryAccentMap[category] || categoryAccentMap.Other
}
