'use client'

import { useMemo, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'

import type { DayFilter } from '@/types'
import { MISC } from '@/common'

const NO_DAYS = new Set<string>()

type UseDayFilterProps = {
  isDemoMode: boolean
  isDisabled: boolean
}

/**
 * Days deselected in the date explorer, shared by the transactions and stats views via the workspace context.
 * Deselected rather than selected days are stored, so days of newly added files are shown. Not stored in demo mode,
 * so the demo starts with all days selected and doesn't filter the user's files. None while `isDisabled` (the CSV
 * view, where the date explorer doesn't apply).
 */
export const useDayFilter = ({ isDemoMode, isDisabled }: UseDayFilterProps): DayFilter => {
  const [storedDays, setStoredDays] = useLocalStorage<string[]>(MISC.LS_STATS_DESELECTED_DAYS_KEY, [], {
    initializeWithValue: false,
  })
  const storedDeselectedDays = useMemo(() => new Set(storedDays), [storedDays])
  const [demoDeselectedDays, setDemoDeselectedDays] = useState<Set<string>>(new Set())
  const [wasDemoMode, setWasDemoMode] = useState(isDemoMode)

  // Reset when entering or leaving the demo, the page stays mounted
  if (isDemoMode !== wasDemoMode) {
    setWasDemoMode(isDemoMode)
    setDemoDeselectedDays(new Set())
  }

  const deselectedDays = isDemoMode ? demoDeselectedDays : storedDeselectedDays
  const setDeselectedDays = isDemoMode ? setDemoDeselectedDays : (days: Set<string>) => setStoredDays([...days])

  return { deselectedDays: isDisabled ? NO_DAYS : deselectedDays, setDeselectedDays }
}
