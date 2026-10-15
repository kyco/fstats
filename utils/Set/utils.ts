/**
 * Removes the key if it's in the set, otherwise adds it. Returns a new set.
 */
export const toggleKey = <T>(set: Set<T>, key: T) => {
  const next = new Set(set)

  if (!next.delete(key)) {
    next.add(key)
  }

  return next
}

/**
 * Removes the keys if any of them is in the set, otherwise adds them all, e.g. to include a group of excluded
 * categories again. Returns a new set.
 */
export const toggleKeys = <T>(set: Set<T>, keys: T[]) => {
  const isRemoving = keys.some((key) => set.has(key))
  const next = new Set(set)
  keys.forEach((key) => (isRemoving ? next.delete(key) : next.add(key)))
  return next
}

/**
 * Number of the keys in the set.
 */
export const countIn = <T>(set: Set<T>, keys: T[]) => {
  return keys.filter((key) => set.has(key)).length
}

/**
 * Checkbox state of a group: checked when none of its items are excluded, indeterminate when some are.
 */
export const getCheckState = (excludedCount: number, total: number) => {
  return { checked: excludedCount === 0, indeterminate: excludedCount > 0 && excludedCount < total }
}
