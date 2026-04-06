'use client'

import { useEffect, useState } from 'react'
import { X, Clock, ChevronRight, Zap } from 'lucide-react'
import type { ReminderToastData } from '@/types/reminder.types'

interface Props {
  data: ReminderToastData
  onDismiss: () => void
  onOpenTimetable: () => void
}

export function ReminderToast({ data, onDismiss, onOpenTimetable }: Props) {
  const [timeLeft, setTimeLeft] = useState(data.minutesBefore * 60)
  const isUrgent = data.minutesBefore <= 1
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  const formatTimeLeft = (seconds: number): string => {
    if (seconds <= 0) return 'Starting now!'
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  }
  
  return (
    <div
      className={`
        reminder-toast
        w-[380px] rounded-2xl overflow-hidden
        border backdrop-blur-xl
        shadow-2xl
        transition-all duration-150-all duration-300
        ${isUrgent 
          ? 'border-orange-500/40 bg-orange-950/40 shadow-orange-500/20' 
          : 'border-forge-accent/30 bg-forge-base/80 shadow-forge-accent/10'
        }
      `}
      style={{
        boxShadow: `0 0 40px ${data.color}15, 0 20px 40px rgba(0,0,0,0.4)`
      }}
    >
      <div 
        className="h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, ${data.color}, transparent)` }}
      />
      
      <div className="p-4">
        
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
              style={{ 
                background: data.color,
                boxShadow: `0 0 8px ${data.color}80`
              }}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-forge-text-muted">
                  StudyForge
                </span>
                {isUrgent && (
                  <span className="text-[9px] font-bold tracking-wider uppercase 
                    text-orange-400 bg-orange-500/20 px-1.5 py-0.5 rounded-full">
                    URGENT
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg hover:bg-forge-overlay transition-all duration-150-colors 
              text-forge-text-secondary hover:text-forge-text-primary flex-shrink-0 active:scale-[0.97]"
          >
            <X size={14} />
          </button>
        </div>
        
        <div className="mb-3">
          <h3 className="text-[15px] font-semibold text-forge-text-primary leading-tight mb-0.5">
            {data.subject}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-forge-text-muted capitalize">
              {data.subjectType}
            </span>
            {data.priority === 'High' && (
              <span className="flex items-center gap-0.5 text-[10px] 
                text-red-400 font-medium">
                <Zap size={9} className="fill-current" />
                High Priority
              </span>
            )}
          </div>
        </div>
        
        <p className="text-[13px] text-forge-text-secondary leading-relaxed mb-4">
          {data.message}
        </p>
        
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1.5 text-[12px] font-mono
            ${isUrgent ? 'text-orange-400' : 'text-forge-accent'}`}>
            <Clock size={12} />
            <span className="font-semibold tabular-nums">
              {formatTimeLeft(timeLeft)}
            </span>
            <span className="text-forge-text-muted font-normal">
              remaining
            </span>
          </div>
          
          <button
            onClick={onOpenTimetable}
            className={`
              flex items-center gap-1 text-[12px] font-medium
              px-3 py-1.5 rounded-lg transition-all duration-150-all duration-150
              ${isUrgent
                ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'
                : 'bg-forge-accent/20 text-forge-accent-bright hover:bg-forge-accent/30'
              }
            `}
          >
            Open
            <ChevronRight size={12} />
          </button>
        </div>
        
      </div>
      
      <div className="h-[2px] bg-forge-border">
        <div
          className="h-full transition-all duration-150-all duration-1000 ease-linear"
          style={{
            width: `${(timeLeft / (data.minutesBefore * 60)) * 100}%`,
            background: isUrgent ? '#f97316' : data.color
          }}
        />
      </div>
    </div>
  )
}
