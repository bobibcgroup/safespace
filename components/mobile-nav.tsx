'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageSquare, BarChart3, Settings, Plus } from 'lucide-react'
import { Button } from './ui/button'

export function MobileNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <Button
                  variant={active ? 'default' : 'ghost'}
                  className="w-full flex flex-col items-center gap-1 h-auto py-2"
                  size="sm"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            )
          })}
          <Link href="/campaigns/new" className="flex-1">
            <Button
              variant="default"
              className="w-full flex flex-col items-center gap-1 h-auto py-2"
              size="sm"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">Create</span>
            </Button>
          </Link>
        </div>
      </div>
      {/* Spacer for mobile nav */}
      <div className="md:hidden h-16" />
    </>
  )
}

