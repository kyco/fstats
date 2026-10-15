'use client'

import type { ReactNode } from 'react'

import { useDarkModeMetaTagUpdater } from '@/hooks'

type InnerWrapperProps = {
  children: ReactNode
}

const Component = ({ children }: InnerWrapperProps) => {
  useDarkModeMetaTagUpdater()
  return <>{children}</>
}

export default Component
