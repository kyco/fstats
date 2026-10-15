import type { MenuSelectOption } from '@/types'

/**
 * Options whose label or group contains the query, ignoring case. All of a group when its name matches.
 */
export const filterOptions = (options: MenuSelectOption[], query: string) => {
  const needle = query.trim().toLowerCase()

  if (!needle) {
    return options
  }

  return options.filter(
    (option) => option.label.toLowerCase().includes(needle) || !!option.group?.toLowerCase().includes(needle),
  )
}
