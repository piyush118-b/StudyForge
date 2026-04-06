'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function useKeyboardShortcuts() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) return

      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const modKey = isMac ? e.metaKey : e.ctrlKey

      if (modKey && e.key === '1') { e.preventDefault(); router.push('/dashboard') }
      if (modKey && e.key === '2') { e.preventDefault(); router.push('/dashboard/timetables') }
      if (modKey && e.key === '3') { e.preventDefault(); router.push('/dashboard/tasks') }
      if (modKey && e.key === '4') { e.preventDefault(); router.push('/dashboard/analytics') }
      if (modKey && e.key === 'n') { e.preventDefault(); router.push('/create') }
      if (modKey && e.key === ',') { e.preventDefault(); router.push('/dashboard/settings') }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, pathname])
}
