'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTimetableStore } from '@/store/timetable-store'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { TimetableGridEditor } from '@/components/editor/TimetableGridEditor'
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState'
import { SidebarProperties } from '@/components/editor/SidebarProperties'

export default function DashboardPage() {
  const { user } = useAuth()
  const { 
    allTimetables,
    currentTimetable,
    setCurrentTimetable,
  } = useTimetableStore()
  
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  
  // Find the active timetable
  const activeTimetable = allTimetables.find(t => t.isActive) || null

  // ── Fresh fetch every time the dashboard mounts or tab regains focus ──
  // This ensures block statuses (done/partial) saved by the editor are never
  // lost when the user navigates away and returns.
  useEffect(() => {
    const fetchFresh = async () => {
      if (!activeTimetable?.id || !user) return
      const { data } = await supabase
        .from('timetables')
        .select('*')
        .eq('id', activeTimetable.id)
        .single()
      if (data) setCurrentTimetable(data)
    }

    fetchFresh()

    // Also refresh when the tab becomes visible again
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchFresh()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [activeTimetable?.id, user])  // eslint-disable-line react-hooks/exhaustive-deps

  // Handle block selection → open right panel
  const handleBlockSelect = useCallback((blockId: string | null) => {
    setSelectedBlockId(blockId)
    setRightPanelOpen(blockId !== null)
  }, [])
  
  return (
    <div className="h-full w-full relative">
      {/* ZONE 3: Canvas area */}
      <main className="h-full w-full overflow-hidden relative">
        {activeTimetable && currentTimetable ? (
          <TimetableGridEditor
            timetableId={activeTimetable.id}
            initialData={currentTimetable}
            mode="dashboard"
            onBlockSelect={handleBlockSelect}
          />
        ) : (
          <DashboardEmptyState
            hasAnyTimetable={allTimetables.length > 0}
          />
        )}
      </main>
      
      {/* ZONE 3B: Right properties panel (conditional overlap) */}
      {rightPanelOpen && selectedBlockId && (
         <div className="absolute top-0 right-0 bottom-0 w-[280px] bg-[#0A0C14]/95 backdrop-blur-xl border-l border-white/10 z-[60] shadow-2xl animate-in slide-in-from-right-8 duration-200">
           <SidebarProperties
             blockId={selectedBlockId}
             onClose={() => handleBlockSelect(null)}
             variant="dashboard"
           />
         </div>
      )}
    </div>
  )
}
