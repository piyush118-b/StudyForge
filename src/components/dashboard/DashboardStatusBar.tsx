"use client"

import React from 'react'
import { TimetableRecord } from '@/store/timetable-store'
import { useGridStore } from '@/store/grid-store'
import { ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function DashboardStatusBar({ activeTimetable }: { activeTimetable: TimetableRecord | null }) {
  const { currentSnapInterval, setSnapInterval } = useGridStore()

  const scrollToToday = () => {
    // We assume TimetableGridEditor exposes a global logic or grid-store has pan coordinates
    // We can dispatch a custom event that TimetableGrid Editor listens for
    window.dispatchEvent(new CustomEvent('scroll-to-today'))
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-8 z-50 bg-[#0A0C14]/85 backdrop-blur-[12px] border-t border-white/10 flex items-center px-4" style={{ WebkitBackdropFilter: 'blur(12px)' }}>
      
      {/* SNAP SELECTOR */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center gap-1.5 cursor-pointer hover:bg-white/5 px-2 py-1 rounded-md transition-colors">
            <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">SNAP</span>
            <span className="text-[11px] font-medium text-slate-300">
              {currentSnapInterval === 15 ? '15 mins' : currentSnapInterval === 30 ? '30 mins' : '1 hr'}
            </span>
            <ChevronDown size={12} className="text-slate-500" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-[#1A1C24] border-white/10">
          <DropdownMenuItem onClick={() => setSnapInterval(15)} className="text-xs focus:bg-indigo-500/20 focus:text-indigo-300 cursor-pointer">15 min</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSnapInterval(30)} className="text-xs focus:bg-indigo-500/20 focus:text-indigo-300 cursor-pointer">30 min</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSnapInterval(60)} className="text-xs focus:bg-indigo-500/20 focus:text-indigo-300 cursor-pointer">1 hr</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-3 bg-white/10 mx-3" />

      {/* HINTS */}
      <div className="hidden xl:flex items-center gap-4 text-[10px] text-slate-500">
        <span>Space + Drag to Pan</span>
        <span>Ctrl + Scroll to Zoom</span>
      </div>

      <div className="flex-1" />

      {/* TODAY PILL */}
      <button 
        onClick={scrollToToday}
        className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase transition-colors"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Today
      </button>

      <div className="w-px h-3 bg-white/10 mx-3 hidden sm:block" />

      {/* ACTIVE TIMETABLE INDICATOR */}
      <div className="hidden sm:flex items-center gap-2 max-w-[150px]">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: activeTimetable?.colorTag || '#6366f1' }} />
        <span className="text-[11px] text-slate-400 font-medium truncate">
          {activeTimetable?.title || 'Draft'}
        </span>
      </div>

    </footer>
  )
}
