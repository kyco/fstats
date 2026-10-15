export const toPercent = (value: number) => `${Math.round(value)}%`

export const isChanged = (value: number, defaultValue: number | undefined) =>
  defaultValue !== undefined && Math.round(value) !== Math.round(defaultValue)
