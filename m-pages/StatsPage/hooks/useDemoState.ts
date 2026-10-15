'use client'

import { useState } from 'react'

import type { DemoState } from '@/types'

/**
 * Page state backing `useViewStorage` in demo mode. Reset when entering or leaving the demo, the page stays mounted.
 */
export const useDemoState = (isDemoMode: boolean): DemoState => {
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [wasDemoMode, setWasDemoMode] = useState(isDemoMode)

  if (isDemoMode !== wasDemoMode) {
    setWasDemoMode(isDemoMode)
    setValues({})
  }

  return { values, setValues }
}
