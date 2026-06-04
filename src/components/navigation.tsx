'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function Navigation() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/attendance', label: 'Attendance' },
    { href: '/reports', label: 'Reports' },
    { href: '/settings', label: 'Settings' },
  ]

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold">
              Attendance Tracker
            </Link>
            <div className="hidden md:flex items-center gap-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={pathname === item.href ? 'default' : 'ghost'}
                    size="sm"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
