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
    <footer className="fixed bottom-0 left-0 right-0 h-8 z-50 bg-forge-elevated/85 backdrop-blur-[12px] border-t border-forge-border flex items-center px-4" style={{ WebkitBackdropFilter: 'blur(12px)' }}>
      
      {/* SNAP SELECTOR */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center gap-1.5 cursor-pointer hover:bg-forge-overlay px-2 py-1 rounded-md transition-colors">
            <span className="text-[10px] font-bold text-forge-accent tracking-widest uppercase">SNAP</span>
            <span className="text-[11px] font-medium text-forge-text-primary">
              {currentSnapInterval === 15 ? '15 mins' : currentSnapInterval === 30 ? '30 mins' : '1 hr'}
            </span>
            <ChevronDown size={12} className="text-forge-text-muted" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-forge-elevated border-forge-border shadow-forge-md">
          <DropdownMenuItem onClick={() => setSnapInterval(15)} className="text-xs focus:bg-forge-overlay focus:text-forge-text-primary cursor-pointer">15 min</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSnapInterval(30)} className="text-xs focus:bg-forge-overlay focus:text-forge-text-primary cursor-pointer">30 min</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSnapInterval(60)} className="text-xs focus:bg-forge-overlay focus:text-forge-text-primary cursor-pointer">1 hr</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-3 bg-forge-border mx-3" />

      {/* HINTS */}
      <div className="hidden xl:flex items-center gap-4 text-[10px] text-forge-text-muted">
        <span>Space + Drag to Pan</span>
        <span>Ctrl + Scroll to Zoom</span>
      </div>

      <div className="flex-1" />

      {/* TODAY PILL */}
      <button 
        onClick={scrollToToday}
        className="flex items-center gap-1.5 bg-forge-accent/10 hover:bg-forge-accent/20 border border-forge-accent/20 text-forge-accent px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase transition-colors shadow-sm"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-forge-accent" />
        Today
      </button>

      <div className="w-px h-3 bg-forge-border mx-3 hidden sm:block" />

      {/* ACTIVE TIMETABLE INDICATOR */}
      <div className="hidden sm:flex items-center gap-2 max-w-[150px]">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: activeTimetable?.colorTag || '#10b981' }} />
        <span className="text-[11px] text-forge-text-secondary font-medium truncate">
          {activeTimetable?.title || 'Draft'}
        </span>
      </div>

    </footer>
  )
}
