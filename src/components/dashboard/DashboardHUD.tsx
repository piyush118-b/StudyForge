"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { TimetableRecord } from '@/store/timetable-store'
import { useAuth } from '@/lib/auth-context'
import { TimetableNameDropdown } from './TimetableDropdown'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { LogOut, User } from 'lucide-react'

interface DashboardHUDProps {
  timetable: TimetableRecord | null
  allTimetables: TimetableRecord[]
  onSwitchTimetable: (id: string) => void
  saveStatus: string
  userId?: string
}

export function DashboardHUD({
  timetable,
  allTimetables,
  onSwitchTimetable,
  saveStatus
}: DashboardHUDProps) {
  const { profile, signOut } = useAuth()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 h-12 z-50 bg-[#0A0C14]/85 backdrop-blur-[12px] border-b border-white/10 flex items-center px-4 justify-between" style={{ WebkitBackdropFilter: 'blur(12px)' }}>
      
      {/* LEFT GROUP */}
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
        </Link>
        
        <div className="w-px h-5 bg-white/20 hidden sm:block" />
        
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
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[livePulse_2s_ease-in-out_infinite] shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Live</span>
            
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-slate-900 border border-white/10 rounded text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
              Auto-saves every 5s
            </div>
          </div>
        )}
      </div>

      {/* CENTER GROUP */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 hidden md:flex pointer-events-none">
        <span className="text-[13px] font-medium text-slate-400">
          {time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
        <div className="w-px h-3 bg-white/20" />
        <span className="text-[13px] font-semibold text-slate-300 tabular-nums">
          {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </span>
      </div>

      {/* RIGHT GROUP */}
      <div className="flex items-center gap-4 shrink-0">
        
        <div className="hidden md:block w-px h-4 bg-white/20" />
        
        {/* Save Status */}
        <div className="hidden sm:flex items-center min-w-[70px] justify-end">
          {saveStatus === 'saving' && <span className="text-[11px] text-slate-400 font-medium">💾 Saving...</span>}
          {saveStatus === 'saved' && <span className="text-[11px] text-emerald-400 font-medium">✓ Saved</span>}
          {saveStatus === 'error' && <span className="text-[11px] text-rose-400 font-medium whitespace-nowrap">⚠ Save fail</span>}
        </div>

        {/* User Menu */}
        <Popover>
          <PopoverTrigger className="outline-none ml-1">
            <Avatar className="w-[28px] h-[28px] border border-white/10 hover:border-indigo-500/50 transition-colors cursor-pointer rounded-full overflow-hidden">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-slate-800 text-[10px] text-white">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent className="w-56 bg-[#161821] border border-white/10 rounded-xl p-1 shadow-2xl" align="end" sideOffset={10}>
            <div className="px-3 py-2 border-b border-white/5 mb-1">
              <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'Guest User'}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{profile?.email || 'Not signed in'}</p>
            </div>
            <Link href="/dashboard/settings/profile">
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-md transition-colors cursor-pointer">
                <User size={14} /> Profile
              </div>
            </Link>
            <div className="h-px bg-white/5 my-1" />
            <button onClick={signOut} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer">
              <LogOut size={14} /> Sign out
            </button>
          </PopoverContent>
        </Popover>

      </div>
    </header>
  )
}
