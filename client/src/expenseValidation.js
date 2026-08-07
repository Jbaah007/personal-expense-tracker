export function validateExpenseInput(values) {
  const errors = {}

  if (!values.title || values.title.trim().length < 2) {
    errors.title = 'Title must be at least 2 characters.'
  }

  if (!values.amount || Number(values.amount) <= 0) {
    errors.amount = 'Amount must be greater than 0.'
  }

  if (!values.category) {
    errors.category = 'Please choose a category.'
  }

  if (!values.date) {
    errors.date = 'Please select a date.'
  }

  return errors
}
