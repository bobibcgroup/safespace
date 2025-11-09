'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          <Icon className="h-16 w-16 text-primary relative z-10 dark:text-glow" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          {description}
        </p>
        {action && (
          <Link href={action.href}>
            <Button className="glow-green-sm hover:glow-green transition-all">
              {action.label}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

