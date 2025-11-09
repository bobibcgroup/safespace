'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from './toast-provider'

interface KeyboardShortcutsProps {
  onNavigate?: (direction: 'up' | 'down') => void
  onSelect?: () => void
  onClose?: () => void
  showHelp?: boolean
  onToggleHelp?: () => void
}

export function useKeyboardShortcuts({
  onNavigate,
  onSelect,
  onClose,
  showHelp,
  onToggleHelp,
}: KeyboardShortcutsProps = {}) {
  const router = useRouter()
  const { success } = useToast()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Esc to close dialogs even when typing
        if (e.key === 'Escape' && onClose) {
          onClose()
        }
        return
      }

      // Handle shortcuts
      switch (e.key) {
        case 'c':
        case 'C':
          if (e.metaKey || e.ctrlKey) return // Allow Cmd/Ctrl+C
          router.push('/campaigns/new')
          success('Creating new campaign...', 'Press C to create campaign')
          break
        case 'j':
        case 'J':
          if (onNavigate) {
            e.preventDefault()
            onNavigate('down')
          }
          break
        case 'k':
        case 'K':
          if (onNavigate) {
            e.preventDefault()
            onNavigate('up')
          }
          break
        case 'Enter':
          if (onSelect) {
            e.preventDefault()
            onSelect()
          }
          break
        case 'Escape':
          if (onClose) {
            onClose()
          }
          break
        case '?':
          if (onToggleHelp) {
            e.preventDefault()
            onToggleHelp()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, onNavigate, onSelect, onClose, onToggleHelp, success])
}

