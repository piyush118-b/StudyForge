"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { TimetableRecord } from '@/store/timetable-store'
import { useAuth } from '@/lib/auth-context'
import { TimetableNameDropdown } from './TimetableDropdown'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { LogOut, User, Bell, Clock } from 'lucide-react'
import { ScheduledReminder } from '@/types/reminder.types'
import { useReminderStore } from '@/store/reminder-store'

function NextReminderChip({ reminder }: { reminder: ScheduledReminder }) {
  const [minutesLeft, setMinutesLeft] = useState(
    Math.round(reminder.timeUntilMs / 60000)
  )
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const left = Math.round((reminder.scheduledFor.getTime() - now) / 60000)
      setMinutesLeft(Math.max(0, left))
    }, 30000)
    return () => clearInterval(interval)
  }, [reminder])
  
  if (minutesLeft > 30) return null
  
  return (
    <div className={`
        flex items-center gap-1.5 px-2.5 py-1 rounded-full
        text-[11px] font-medium transition-all
        ${minutesLeft <= 5 
          ? 'bg-forge-error/15 border border-forge-error/30 text-forge-error/90'
          : 'bg-forge-overlay border border-forge-border text-forge-text-muted'
        }
      `}>
        <div className={`w-1.5 h-1.5 rounded-full ${
          minutesLeft <= 5 ? 'bg-forge-error animate-pulse' : 'bg-forge-text-muted/50'
        }`} />
        <span>{reminder.block.subject}</span>
        <span className="text-forge-text-muted/70">in</span>
      <span className="tabular-nums">{minutesLeft}m</span>
    </div>
  )
}

interface DashboardHUDProps {
  timetable: TimetableRecord | null
  allTimetables: TimetableRecord[]
  onSwitchTimetable: (id: string) => void
  saveStatus: string
  userId?: string
  onOpenReminderSettings: () => void
}

export function DashboardHUD({
  timetable,
  allTimetables,
  onSwitchTimetable,
  saveStatus,
  onOpenReminderSettings
}: DashboardHUDProps) {
  const { profile, signOut } = useAuth()
  const [time, setTime] = useState(new Date())
  const nextReminder = useReminderStore(s => s.nextReminder)

  useEffect(() => {
    // Update every second so the clock is always perfectly accurate
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 bg-[#111111]/90 backdrop-blur-[12px] border-b border-[#2A2A2A] flex items-center px-4 justify-between" style={{ WebkitBackdropFilter: 'blur(12px)' }}>
      
      {/* LEFT GROUP */}
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/">
          <div className="w-8 h-8 rounded-lg bg-[rgba(16,185,129,0.12)] border border-[#10B981]/25 flex items-center justify-center shadow-sm hover:scale-105 transition-transform hover:bg-[rgba(16,185,129,0.2)]">
            <BookOpen className="w-4 h-4 text-[#10B981]" />
          </div>
        </Link>
        
        <div className="w-px h-5 bg-[#2A2A2A] hidden sm:block" />
        
        <div className="hidden sm:block">
          <TimetableNameDropdown 
            timetables={allTimetables}
            active={timetable}
            onSwitch={onSwitchTimetable}
          />
        </div>
        
        {/* Pulsing Live Dot */}
        {timetable && (
          <div className="flex items-center gap-1.5 ml-2 tooltip-trigger group relative cursor-help">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-[livePulse_2s_ease-in-out_infinite] shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
            <span className="text-[10px] uppercase font-bold text-[#606060] tracking-wide">Live</span>
            
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-[10px] text-[#A0A0A0] opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
              Auto-saves every 5s
            </div>
          </div>
        )}
      </div>

      {/* CENTER GROUP */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-3 hidden md:flex pointer-events-none">
        {nextReminder && <NextReminderChip reminder={nextReminder} />}
        {nextReminder && <div className="w-px h-3 bg-[#2A2A2A]" />}
        <span className="text-[13px] font-medium text-[#A0A0A0]">
          {time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
        <div className="w-px h-3 bg-[#2A2A2A]" />
        <span className="text-[13px] font-semibold text-[#F0F0F0] tabular-nums">
          {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </span>
      </div>

      {/* RIGHT GROUP */}
      <div className="flex items-center gap-4 shrink-0">
        
        <div className="hidden md:block w-px h-4 bg-[#2A2A2A]" />
        
        {/* Save Status */}
        <div className="hidden sm:flex items-center min-w-[70px] justify-end">
          {saveStatus === 'saving' && <span className="text-[11px] text-[#606060] font-medium">💾 Saving...</span>}
          {saveStatus === 'saved' && <span className="text-[11px] text-[#10B981] font-medium">✓ Saved</span>}
          {saveStatus === 'error' && <span className="text-[11px] text-[#EF4444] font-medium whitespace-nowrap">⚠ Save fail</span>}
        </div>

        {/* Reminders Bell Token */}
        <button 
          onClick={onOpenReminderSettings}
          className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#222222] transition-colors text-[#A0A0A0] hover:text-[#F0F0F0]"
        >
          <Bell size={16} />
          {nextReminder && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          )}
        </button>

        {/* User Menu */}
        <Popover>
          <PopoverTrigger className="outline-none ml-1">
            <Avatar className="w-[28px] h-[28px] border border-[#2A2A2A] hover:border-[#10B981]/50 transition-colors cursor-pointer rounded-full overflow-hidden">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-[#222222] text-[10px] text-[#F0F0F0]">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent className="w-56 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1 shadow-[0_8px_32px_rgba(0,0,0,0.5)]" align="end" sideOffset={10}>
            <div className="px-3 py-2 border-b border-[#2A2A2A] mb-1">
              <p className="text-sm font-semibold text-[#F0F0F0] truncate">{profile?.full_name || 'Guest User'}</p>
              <p className="text-xs text-[#606060] truncate mt-0.5">{profile?.email || 'Not signed in'}</p>
            </div>
            <Link href="/dashboard/settings/profile">
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#222222] rounded-md transition-colors cursor-pointer">
                <User size={14} /> Profile
              </div>
            </Link>
            <div className="h-px bg-[#2A2A2A] my-1" />
            <button onClick={signOut} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-[#EF4444] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] rounded-md transition-colors cursor-pointer">
              <LogOut size={14} /> Sign out
            </button>
          </PopoverContent>
        </Popover>

      </div>
    </header>
  )
}
