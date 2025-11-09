'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from './ui/button'

export function FloatingActionButton() {
  return (
    <Link href="/campaigns/new">
      <Button
        size="lg"
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-2xl glow-green-sm hover:glow-green transition-all duration-300 z-50 dark:bg-primary dark:text-primary-foreground"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Create Campaign</span>
      </Button>
    </Link>
  )
}

