'use client'

import { useCallback } from 'react'
import { useLocalStorage } from 'usehooks-ts'

import { useWorkspace } from '../context'

/**
 * View state stored in local storage, or in the page state in demo mode, so the demo starts with the defaults and
 * doesn't filter the user's files.
 */
export const useViewStorage = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
  const { isDemoMode, demoState } = useWorkspace()
  const [storedValue, setStoredValue] = useLocalStorage<T>(key, initialValue, { initializeWithValue: false })
  const { values, setValues } = demoState
  const setDemoValue = useCallback((value: T) => setValues((state) => ({ ...state, [key]: value })), [key, setValues])

  if (!isDemoMode) {
    return [storedValue, setStoredValue]
  }

  return [key in values ? (values[key] as T) : initialValue, setDemoValue]
}
