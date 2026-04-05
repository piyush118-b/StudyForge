"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, Plus } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TimetableRecord } from "@/store/timetable-store"

function formatRelativeTime(dateString: string) {
  const diffHours = Math.round((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60))
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.round(diffHours / 24)}d ago`
}

export function TimetableNameDropdown({ 
  timetables, 
  active, 
  onSwitch 
}: {
  timetables: TimetableRecord[]
  active: TimetableRecord | null
  onSwitch: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-2 hover:bg-forge-overlay px-2 py-1.5 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-forge-accent/50">
          {/* Color dot */}
          <div 
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: active?.colorTag || 'var(--color-forge-accent)' }}
          />
          {/* Name */}
          <span className="text-sm font-semibold text-forge-text-primary tracking-tight truncate max-w-[140px]">
            {active?.title || 'No active timetable'}
          </span>
          <ChevronDown size={14} className="text-forge-text-muted shrink-0" />
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-72 bg-forge-elevated border border-forge-border shadow-forge-xl p-0 rounded-xl overflow-hidden"
        align="start"
        sideOffset={8}
      >
        <div className="px-3 py-2.5 border-b border-forge-border bg-forge-overlay/30">
          <span className="text-[11px] font-bold tracking-widest text-forge-text-muted uppercase">My Timetables</span>
        </div>
        
        <div className="max-h-[280px] overflow-y-auto p-1">
          {timetables.map(t => (
            <button
              key={t.id}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${t.isActive ? 'bg-forge-accent/10' : 'hover:bg-forge-overlay'}`}
              onClick={() => {
                onSwitch(t.id)
                setOpen(false)
              }}
            >
              <div 
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: t.colorTag || 'var(--color-forge-accent)' }}
              />
              <span className={`text-sm flex-1 truncate ${t.isActive ? 'text-forge-accent font-semibold' : 'text-forge-text-secondary'}`}>
                {t.title}
              </span>
              
              {t.isActive && (
                <span className="text-[10px] font-bold text-forge-accent bg-forge-accent/20 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                  Active
                </span>
              )}
              
              {!t.isActive && (
                <span className="text-[10px] text-forge-text-muted shrink-0">
                  {formatRelativeTime(t.updatedAt)}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className="h-px w-full bg-forge-border" />
        
        <div className="p-1">
          <Link href="/create" onClick={() => setOpen(false)}>
            <div className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors text-forge-text-secondary hover:text-forge-text-primary hover:bg-forge-overlay cursor-pointer">
              <Plus size={14} className="text-forge-text-muted" />
              <span className="text-sm font-medium">Create New Timetable</span>
            </div>
          </Link>
          
          <Link href="/dashboard/timetables" onClick={() => setOpen(false)}>
            <div className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors text-forge-text-secondary hover:text-forge-accent hover:bg-forge-accent/10 cursor-pointer">
              <span className="text-sm font-medium w-full text-center">Manage all timetables &rarr;</span>
            </div>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
