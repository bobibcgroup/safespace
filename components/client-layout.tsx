'use client'

import { Header } from "@/components/header"
import { Providers } from "@/components/providers"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Header />
      {children}
    </Providers>
  )
}

