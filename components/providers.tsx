'use client'

import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from '@/components/toast-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from './header'
import { MobileNav } from './mobile-nav'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>
      <Header />
      {children}
      <MobileNav />
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}

