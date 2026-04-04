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
      <PopoverTrigger className="flex items-center gap-2 hover:bg-white/5 px-2 py-1.5 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-indigo-500/50">
          {/* Color dot */}
          <div 
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: active?.colorTag || '#6366f1' }}
          />
          {/* Name */}
          <span className="text-sm font-semibold text-slate-200 tracking-tight truncate max-w-[140px]">
            {active?.title || 'No active timetable'}
          </span>
          <ChevronDown size={14} className="text-slate-500 shrink-0" />
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-72 bg-[#12141D] border border-white/10 shadow-2xl p-0 rounded-xl overflow-hidden"
        align="start"
        sideOffset={8}
      >
        <div className="px-3 py-2.5 border-b border-white/5 bg-black/20">
          <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">My Timetables</span>
        </div>
        
        <div className="max-h-[280px] overflow-y-auto p-1">
          {timetables.map(t => (
            <button
              key={t.id}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${t.isActive ? 'bg-indigo-500/10' : 'hover:bg-white/5'}`}
              onClick={() => {
                onSwitch(t.id)
                setOpen(false)
              }}
            >
              <div 
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: t.colorTag || '#6366f1' }}
              />
              <span className={`text-sm flex-1 truncate ${t.isActive ? 'text-indigo-300 font-medium' : 'text-slate-300'}`}>
                {t.title}
              </span>
              
              {t.isActive && (
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                  Active
                </span>
              )}
              
              {!t.isActive && (
                <span className="text-[10px] text-slate-500 shrink-0">
                  {formatRelativeTime(t.updatedAt)}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className="h-px w-full bg-white/5" />
        
        <div className="p-1">
          <Link href="/create" onClick={() => setOpen(false)}>
            <div className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer">
              <Plus size={14} className="text-slate-400" />
              <span className="text-sm font-medium">Create New Timetable</span>
            </div>
          </Link>
          
          <Link href="/dashboard/timetables" onClick={() => setOpen(false)}>
            <div className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 cursor-pointer">
              <span className="text-sm font-medium w-full text-center">Manage all timetables &rarr;</span>
            </div>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
