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
import { GuestBanner } from '@/components/dashboard/GuestBanner'
import { GuestMigrationPrompt } from '@/components/auth/GuestMigrationPrompt'
import { useMemo } from 'react'
import type { ReminderBlock } from '@/types/reminder.types'
import { ReminderPermissionCard } from '@/components/reminders/ReminderPermissionCard'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import {
  LayoutDashboard, Calendar, BarChart3,
  CheckSquare, Camera, Trophy, Settings, Zap, X
} from 'lucide-react'
import { useSubscriptionStore } from '@/store/subscription-store'
import { TimetableNameDropdown } from '@/components/dashboard/TimetableDropdown'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal } from '@/components/ui/keyboard-shortcuts-modal';
import { CommandPalette } from '@/components/ui/command-palette';

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const { isPro } = useSubscriptionStore()
  const userEmail = user?.email || 'guest@studyforge.ai'
  const userName = user?.user_metadata?.full_name || 'Guest User'
  const userInitial = userName.charAt(0).toUpperCase()

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Today's Plan" },
    { href: "/dashboard/timetables", icon: Calendar, label: "My Timetables" },
    { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/dashboard/tasks", icon: CheckSquare, label: "Task Board" },
    { href: "/dashboard/scanner", icon: Camera, label: "OCR Scanner" },
    { href: "/dashboard/achievements", icon: Trophy, label: "Achievements" },
    { href: "/pricing", icon: Zap, label: "Upgrade to Pro" },
  ]
  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard' || pathname === '/dashboard/today'
      : pathname === href || pathname.startsWith(href + '/')

  // LocalStorage persistence for sidebar — default expanded
  useEffect(() => {
    const val = localStorage.getItem('sf_sidebar_collapsed')
    // Only collapse if explicitly saved as 'true'; treat missing/other as expanded
    if (val === 'true') setSidebarCollapsed(true)
    else localStorage.setItem('sf_sidebar_collapsed', 'false')
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
  
  useKeyboardShortcuts();
  
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
        onOpenMobileNav={() => setMobileNavOpen(true)}
      />
      <CommandPalette />
      <KeyboardShortcutsModal />
      
      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden mt-12 mb-8 relative">
        
        {/* Navigation Rail (Sidebar) */}
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          activePath={pathname}
        />
        
        {/* Dynamic Content: can be the Grid or any Dashboard Sub-page */}
        <main className="flex-1 overflow-hidden relative flex flex-col">
          <GuestBanner />
          <div className="flex-1 w-full overflow-y-auto custom-scrollbar">
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

      <GuestMigrationPrompt />

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileNavOpen(false)}
              className="
                fixed inset-0 z-40
                bg-black/60 backdrop-blur-sm
                md:hidden
              "
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="
                fixed left-0 top-0 bottom-0 z-50
                w-72 md:hidden
                bg-[#111111] border-r border-[#2A2A2A]
                flex flex-col
                overflow-hidden
              "
            >
              {/* Drawer header */}
              <div className="h-14 flex items-center justify-between px-4
                              border-b border-[#2A2A2A] flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg
                                  bg-gradient-to-br from-[#10B981] to-[#059669]" />
                  <span className="font-semibold text-[#F0F0F0] text-sm tracking-tight">
                    StudyForge
                  </span>
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center
                             text-[#606060] hover:text-[#F0F0F0] hover:bg-[#1A1A1A]
                             transition-all duration-150"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Timetable switcher */}
              <div className="px-3 py-3 border-b border-[#2A2A2A] flex-shrink-0">
                <TimetableNameDropdown 
                  timetables={allTimetables}
                  active={activeTimetable}
                  onSwitch={handleSwitchTimetable}
                />
              </div>

              {/* Nav items — same as desktop sidebar */}
              <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
                {navItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      text-sm font-medium transition-all duration-150
                      ${isActive(item.href)
                        ? 'text-[#10B981] bg-[rgba(16,185,129,0.08)] border border-[#10B981]/15'
                        : 'text-[#A0A0A0] border border-transparent hover:bg-[#1A1A1A] hover:text-[#F0F0F0]'
                      }
                    `}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0
                                           ${isActive(item.href) ? 'text-[#10B981]' : ''}`} />
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* User footer */}
              <div className="p-3 border-t border-[#2A2A2A] flex-shrink-0">
                <Link href="/profile" onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-lg
                                 hover:bg-[#1A1A1A] transition-all duration-150">
                  <div className="w-7 h-7 rounded-full
                                  bg-gradient-to-br from-[#10B981] to-[#059669]
                                  flex items-center justify-center
                                  text-xs font-bold text-[#0A0A0A] flex-shrink-0">
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#F0F0F0] truncate">{userEmail}</p>
                    <p className="text-[10px] text-[#606060]">{isPro ? '⚡ Pro' : 'Free'}</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
