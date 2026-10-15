import type { KeyboardEvent } from 'react'

/**
 * Clicks an element with `role="button"` on Enter or Space, like a native button. Ignores events of its children.
 */
export const onRowKeyDown = (event: KeyboardEvent<HTMLElement>) => {
  if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    event.currentTarget.click()
  }
}
