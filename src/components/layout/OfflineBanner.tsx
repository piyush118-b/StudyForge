'use client'
import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const handleOffline = () => setIsOffline(true)
    const handleOnline  = () => setIsOffline(false)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online',  handleOnline)
    // Check initial state
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true)
    }
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online',  handleOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="fixed top-0 inset-x-0 z-[200]
                    bg-[#F59E0B] px-4 py-2
                    flex items-center justify-center gap-2 text-sm font-medium
                    text-[#0A0A0A]">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238L3 3l2 2m10.657 10.657L12 12m0 0L8.464 8.464m3.536 3.536l-2-2" />
      </svg>
      You&apos;re offline — changes will sync when you reconnect
    </div>
  )
}
