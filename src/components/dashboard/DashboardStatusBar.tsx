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
    <footer className="fixed bottom-0 left-0 right-0 h-8 z-50 bg-[#111111]/90 backdrop-blur-[12px] border-t border-[#2A2A2A] flex items-center px-4" style={{ WebkitBackdropFilter: 'blur(12px)' }}>
      
      {/* SNAP SELECTOR */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center gap-1.5 cursor-pointer hover:bg-[#222222] px-2 py-1 rounded-md transition-all duration-150-colors">
            <span className="text-[10px] font-bold text-[#10B981] tracking-widest uppercase">SNAP</span>
            <span className="text-[11px] font-medium text-[#F0F0F0]">
              {currentSnapInterval === 15 ? '15 mins' : currentSnapInterval === 30 ? '30 mins' : '1 hr'}
            </span>
            <ChevronDown size={12} className="text-[#606060]" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-[#1A1A1A] border-[#2A2A2A] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <DropdownMenuItem onClick={() => setSnapInterval(15)} className="text-xs focus:bg-[#222222] focus:text-[#F0F0F0] cursor-pointer">15 min</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSnapInterval(30)} className="text-xs focus:bg-[#222222] focus:text-[#F0F0F0] cursor-pointer">30 min</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSnapInterval(60)} className="text-xs focus:bg-[#222222] focus:text-[#F0F0F0] cursor-pointer">1 hr</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-3 bg-[#2A2A2A] mx-3" />

      {/* HINTS */}
      <div className="hidden xl:flex items-center gap-4 text-[10px] text-[#A0A0A0]">
        <span>Space + Drag to Pan</span>
        <span>Ctrl + Scroll to Zoom</span>
      </div>

      <div className="flex-1" />

      {/* TODAY PILL */}
      <button 
        onClick={scrollToToday}
        className="flex items-center gap-1.5 bg-[rgba(16,185,129,0.1)] hover:bg-[rgba(16,185,129,0.2)] border border-[#10B981]/20 text-[#10B981] px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase transition-all duration-150-colors shadow-sm active:scale-[0.97]"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
        Today
      </button>

      <div className="w-px h-3 bg-[#2A2A2A] mx-3 hidden sm:block" />

      {/* ACTIVE TIMETABLE INDICATOR */}
      <div className="hidden sm:flex items-center gap-2 max-w-[150px]">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: activeTimetable?.colorTag || '#10B981' }} />
        <span className="text-[11px] text-[#A0A0A0] font-medium truncate">
          {activeTimetable?.title || 'Draft'}
        </span>
      </div>

    </footer>
  )
}
