'use client'

import { Box } from '@mui/material'
import type { PointerEvent } from 'react'

import { ui } from './styled'

type ResizeDividerProps = {
  /**
   * `x` between columns, `y` between stacked panes.
   */
  axis: 'x' | 'y'
  /**
   * How far the pointer moved since the drag started, in percent of the parent's size along `axis`. The callback of
   * the drag start is used for the whole drag, so it computes the new sizes from those at the start.
   */
  onResize: (deltaPercent: number) => void
}

/**
 * Line between two panes of a flex container (its parent), dragged to resize them.
 */
const Component = ({ axis, onResize }: ResizeDividerProps) => {
  const sx = ui()

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    const container = event.currentTarget.parentElement

    if (!container) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    const getPosition = (e: { clientX: number; clientY: number }) => (axis === 'x' ? e.clientX : e.clientY)
    const start = getPosition(event)
    const rect = container.getBoundingClientRect()
    const size = axis === 'x' ? rect.width : rect.height

    const onMove = (moveEvent: globalThis.PointerEvent) => {
      onResize(((getPosition(moveEvent) - start) / size) * 100)
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return <Box sx={sx.divider(axis)} onPointerDown={onPointerDown} />
}

export default Component
