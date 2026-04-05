"use client";

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useTimetableStore } from '@/store/timetable-store'
import { useTrackingStore } from '@/store/tracking-store'
import { useAuth } from '@/lib/auth-context'
import { DashboardHUD } from '@/components/dashboard/DashboardHUD'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardStatusBar } from '@/components/dashboard/DashboardStatusBar'
import { useBlockReminder } from '@/hooks/useBlockReminder'
import { ReminderSettingsPanel } from '@/components/reminders/ReminderSettingsPanel'
import { useMemo } from 'react'
import type { ReminderBlock } from '@/types/reminder.types'
import { ReminderPermissionCard } from '@/components/reminders/ReminderPermissionCard'

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
  const [reminderSettingsOpen, setReminderSettingsOpen] = useState(false)
  const [showPermissionCard, setShowPermissionCard] = useState(false)
  
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
  
  const reminderBlocks = useMemo(() => {
    if (!currentTimetable?.grid_data) return []
    // Blocks are stored FLAT at root of grid_data (not under a .blocks key).
    // The only non-block key is _metadata_. Filter it out.
    const rawGridData = currentTimetable.grid_data as Record<string, Record<string, unknown>>
    const blockEntries = Object.entries(rawGridData).filter(([key]) => key !== '_metadata_')
    
    return blockEntries.map(([, block]) => {
      // Blocks from grid-store use `dayId` (e.g. "col_saturday"), but the reminder 
      // scheduler needs the human-readable `day` string (e.g. "Saturday").
      const rawDay = (block.day as string) || ''
      const rawDayId = (block.dayId as string) || ''
      const resolvedDay = rawDay || (rawDayId
        ? rawDayId.replace('col_', '').charAt(0).toUpperCase() + rawDayId.replace('col_', '').slice(1).toLowerCase()
        : '')
      return {
        id: block.id as string,
        subject: block.subject as string,
        subjectType: (block.subjectType as string) || 'Study',
        day: resolvedDay,
        startTime: block.startTime as string,
        endTime: block.endTime as string,
        color: (block.color as string) || '#6366f1',
        priority: (block.priority as 'High' | 'Medium' | 'Low' | null) || null,
        notes: block.notes as string | undefined
      }
    })
  }, [currentTimetable])

  const { permission } = useBlockReminder({
    blocks: reminderBlocks,
    studentName: user?.user_metadata?.full_name || 'Student',
    enabled: true
  })
  
  // Show permission card after a timetable exists
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (activeTimetable && permission === 'default' && !localStorage.getItem('sf_permission_dismissed')) {
      // Small delay so it doesn't pop up instantly jarringly
      const timer = setTimeout(() => setShowPermissionCard(true), 2000)
      return () => clearTimeout(timer)
    } else {
      setShowPermissionCard(false)
    }
  }, [activeTimetable, permission])
  
  const handleDismissPermission = useCallback(() => {
    localStorage.setItem('sf_permission_dismissed', 'true')
    setShowPermissionCard(false)
  }, [])
  
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
    <div className="fixed inset-0 flex flex-col bg-forge-base overflow-hidden z-[50]">
      {/* HUD: Persistent Header */}
      <DashboardHUD
        timetable={activeTimetable}
        allTimetables={allTimetables}
        onSwitchTimetable={handleSwitchTimetable}
        saveStatus={saveStatus}
        userId={user?.id}
        onOpenReminderSettings={() => setReminderSettingsOpen(true)}
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

      {/* Floating Permission Card for Reminders */}
      {showPermissionCard && (
        <div className="fixed bottom-12 right-6 z-[100] w-[340px]">
          <ReminderPermissionCard 
            onDismissed={handleDismissPermission}
            onGranted={handleDismissPermission}
          />
        </div>
      )}

      <ReminderSettingsPanel 
        open={reminderSettingsOpen}
        onClose={() => setReminderSettingsOpen(false)}
        blocks={reminderBlocks}
        studentName={user?.user_metadata?.full_name || 'Student'}
      />
    </div>
  )
}
