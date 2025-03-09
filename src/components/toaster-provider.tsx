'use client'

import { useTheme } from 'next-themes'
import { Toaster } from './ui/sonner'

export function ToasterProvider() {
  const { theme } = useTheme()

  return <Toaster position="top-center" richColors theme={theme as 'light' | 'dark' | 'system'} />
}
