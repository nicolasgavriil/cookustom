const calorieFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
  roundingMode: 'halfExpand',
})

const decimalFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  roundingMode: 'halfExpand',
})

export function formatWholeCalories(calories: number | string): string {
  return calorieFormatter.format(Number(calories))
}

export function formatDecimal(value: number | string): string {
  return decimalFormatter.format(Number(value))
}
