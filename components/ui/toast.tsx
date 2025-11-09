'use client'

import * as React from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, title, description, variant = 'default', onClose, ...props }, ref) => {
    const icons = {
      success: CheckCircle2,
      error: AlertCircle,
      warning: AlertTriangle,
      info: Info,
      default: Info,
    }

    const colors = {
      success: 'bg-green-500/10 border-green-500/20 text-green-500',
      error: 'bg-red-500/10 border-red-500/20 text-red-500',
      warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
      info: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
      default: 'bg-muted border-border text-foreground',
    }

    const Icon = icons[variant]

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-start gap-3 rounded-lg border p-4 shadow-lg',
          colors[variant]
        )}
        {...props}
      >
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          {title && <div className="font-semibold text-sm">{title}</div>}
          {description && <div className="text-sm opacity-90 mt-1">{description}</div>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 rounded-md p-1 hover:bg-background/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Toast.displayName = 'Toast'

export { Toast }

