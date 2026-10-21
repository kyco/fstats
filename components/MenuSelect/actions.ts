import type { MenuSelectOption } from '@/types'

/**
 * Options whose label, description or group contains the query, ignoring case. All of a group when its name matches.
 */
export const filterOptions = (options: MenuSelectOption[], query: string) => {
  const needle = query.trim().toLowerCase()

  if (!needle) {
    return options
  }

  return options.filter(
    (option) =>
      option.label.toLowerCase().includes(needle) ||
      !!option.description?.toLowerCase().includes(needle) ||
      !!option.group?.toLowerCase().includes(needle),
  )
}

/**
 * The trimmed query, when no option has that label (ignoring case), to offer creating one. `null` without a query.
 */
export const getNewOptionName = (options: MenuSelectOption[], query: string) => {
  const name = query.trim()
  const isTaken = options.some((option) => option.label.toLowerCase() === name.toLowerCase())
  return name && !isTaken ? name : null
}
