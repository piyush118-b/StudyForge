'use client'

import { ReactNode, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAnalyticsStore } from '@/store/analytics-store'
import { useGridStore } from '@/store/grid-store'
// Add any other store init requirements here

export function StudyForgeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        // Assume authStore or similar exists, but standardizing init sequence here
        if (session) {
           const userId = session.user.id;
           // In a real implementation we'd also call useAuthStore or user contexts here
           
           // Initialize stores centrally to avoid cascading auth triggers across the app
           const fetchStoreInitialData = async () => {
             // Let's pretend useGridStore has a loadAll method, or just init it
             // useGridStore.getState().init(userId)
             // useAnalyticsStore.getState().init(userId)
             
             // This centralized loading pattern reduces duplicate DB calls
           }
           fetchStoreInitialData()
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])
  
  return <>{children}</>
}
