/**
 * Minimum size of a pane, in percent of the container.
 */
const MIN_PANE_PERCENT = 10

type ResizePanesProps = {
  /**
   * In percent, adding up to 100.
   */
  sizes: number[]
  index: number
  delta: number
}

/**
 * Moves the divider between pane `index` and `index + 1` by `delta` percent, respecting the minimum size. The other
 * panes keep their size.
 */
export const resizePanes = ({ sizes, index, delta }: ResizePanesProps) => {
  const total = sizes[index] + sizes[index + 1]
  const size = Math.min(Math.max(sizes[index] + delta, MIN_PANE_PERCENT), total - MIN_PANE_PERCENT)
  const next = [...sizes]
  next[index] = size
  next[index + 1] = total - size
  return next
}
