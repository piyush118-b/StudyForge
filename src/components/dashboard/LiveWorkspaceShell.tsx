"use client";

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useTimetableStore } from '@/store/timetable-store'
import { useTrackingStore } from '@/store/tracking-store'
import { useAuth } from '@/lib/auth-context'
import { DashboardHUD } from '@/components/dashboard/DashboardHUD'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardStatusBar } from '@/components/dashboard/DashboardStatusBar'

interface LiveWorkspaceShellProps {
  children: React.ReactNode
}

export function LiveWorkspaceShell({ children }: LiveWorkspaceShellProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const { 
    allTimetables,
    currentTimetable,
    loadAllTimetables,
    switchActiveTimetable,
    saveStatus
  } = useTimetableStore()
  
  const { loadTodayBlocks } = useTrackingStore()
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // LocalStorage persistence for sidebar
  useEffect(() => {
    const val = localStorage.getItem('sf_sidebar_collapsed')
    if (val === 'true') setSidebarCollapsed(true)
  }, [])
  
  const toggleSidebar = () => {
    const nextVal = !sidebarCollapsed
    setSidebarCollapsed(nextVal)
    localStorage.setItem('sf_sidebar_collapsed', String(nextVal))
  }

  // Load all timetables on mount (Shell-wide state)
  useEffect(() => {
    if (user?.id) {
      loadAllTimetables(user.id)
    } else {
      loadAllTimetables(undefined)
    }
  }, [user?.id, loadAllTimetables])
  
  const activeTimetable = allTimetables.find(t => t.isActive) || null
  
  // Initial sync when active timetable is known but currentTimetable missing
  useEffect(() => {
    if (activeTimetable?.id && currentTimetable?.id !== activeTimetable.id) {
      switchActiveTimetable(activeTimetable.id, user?.id)
    }
  }, [activeTimetable?.id, currentTimetable?.id, user?.id, switchActiveTimetable])

  // Load today's block progress to drive HUD metrics (Shell-wide analytics)
  useEffect(() => {
    if (activeTimetable?.id && currentTimetable?.grid_data) {
      loadTodayBlocks(activeTimetable.id, currentTimetable.grid_data, new Date().toISOString().split('T')[0])
    }
  }, [activeTimetable?.id, currentTimetable?.id, loadTodayBlocks])

  const handleSwitchTimetable = useCallback(async (id: string) => {
    if (activeTimetable?.id === id) return
    await switchActiveTimetable(id, user?.id)
  }, [activeTimetable?.id, user?.id, switchActiveTimetable])

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0A0C14] overflow-hidden z-[50]">
      {/* HUD: Persistent Header */}
      <DashboardHUD
        timetable={activeTimetable}
        allTimetables={allTimetables}
        onSwitchTimetable={handleSwitchTimetable}
        saveStatus={saveStatus}
        userId={user?.id}
      />
      
      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden mt-12 mb-8 relative">
        
        {/* Navigation Rail (Sidebar) */}
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          activePath={pathname}
        />
        
        {/* Dynamic Content: can be the Grid or any Dashboard Sub-page */}
        <main className="flex-1 overflow-hidden relative">
          <div className="h-full w-full overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </main>
      </div>
      
      {/* Bottom Status Bar */}
      <DashboardStatusBar
        activeTimetable={activeTimetable}
      />
    </div>
  )
}
