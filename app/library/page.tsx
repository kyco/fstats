'use client'

import { Suspense } from 'react'

import { PageWrapper } from '@/components'
import { LibraryPage } from '@/m-pages'

const Page = () => {
  // Reads the search params (the hint or entry to show), which need a suspense boundary when prerendering
  return (
    <Suspense fallback={<PageWrapper />}>
      <LibraryPage />
    </Suspense>
  )
}

export default Page
