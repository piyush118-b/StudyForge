import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/lifecycle'
import { 
  BlockLog, 
  DailySummary, 
  WeeklyAnalytics, 
  BlockWithLog, 
  BlockStatus, 
  EnergyLevel, 
  SkipReason 
} from '@/types/tracking.types'

interface TrackingState {
  // Today's blocks (from active timetable)
  todayBlocks: BlockWithLog[]
  todayDate: string
  
  // Daily Summary for today
  dailySummary: DailySummary | null
  
  // Loading states
  loadingToday: boolean
  loadingAnalytics: boolean
  
  // Analytics cache
  weeklyAnalytics: WeeklyAnalytics | null
  analyticsDateRange: { from: string; to: string }
  
  // Actions
  loadTodayBlocks: (timetableId: string, gridData: any, date: string) => Promise<void>
  markBlockDone: (blockId: string, scheduledDate: string, rating?: number, energy?: EnergyLevel, notes?: string) => Promise<void>
  markBlockPartial: (blockId: string, scheduledDate: string, percentage: number, actualHours: number, reason?: SkipReason, rating?: number) => Promise<void>
  markBlockSkipped: (blockId: string, scheduledDate: string, reason: SkipReason, note?: string) => Promise<void>
  undoBlockMark: (blockId: string, scheduledDate: string) => Promise<void>
  
  // Analytics
  loadWeeklyAnalytics: (from: string, to: string) => Promise<void>
  
  // Real-time updates
  subscribeToTodayUpdates: (userId: string, date: string) => () => void
}

export const useTrackingStore = create<TrackingState>((set, get) => ({
  todayBlocks: [],
  todayDate: new Date().toISOString().split('T')[0],
  dailySummary: null,
  loadingToday: false,
  loadingAnalytics: false,
  weeklyAnalytics: null,
  analyticsDateRange: { from: '', to: '' },

  loadTodayBlocks: async (timetableId, gridData, date) => {
    set({ loadingToday: true, todayDate: date })
    try {
      const response = await fetch(`/api/block-logs?timetableId=${timetableId}&date=${date}`)
      if (!response.ok) throw new Error('Failed to fetch block logs')
      const logs: BlockLog[] = await response.json()
      
      // Date -> day of week, correcting for timezone (use UTC offset)
      const dateObj = new Date(date + 'T12:00:00') // noon to avoid DST issues
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' })
      const dayId = `col_${dayOfWeek.toLowerCase()}`
      
      // gridData format from grid-store: { blockUUID: { dayId, startTime, endTime, subject, ... } }
      let blocks: any[] = []
      if (gridData && typeof gridData === 'object' && !Array.isArray(gridData)) {
        // New flat format
        blocks = Object.values(gridData).filter((b: any) => b.dayId === dayId)
      }
      
      const now = new Date()
      const currentTotalMin = now.getHours() * 60 + now.getMinutes()
      const isTodayView = date === new Date().toISOString().split('T')[0]

      const todayBlocks: BlockWithLog[] = blocks.map((block: any) => {
        const blockId = block.id || block.blockId
        const log = logs.find(l => l.blockId === blockId) || null
        
        let startTotalMin = 0
        let endTotalMin = 0
        const startTime = block.startTime || '00:00'
        const endTime   = block.endTime   || '00:00'
        const [sH, sM] = startTime.split(':').map(Number)
        const [eH, eM] = endTime.split(':').map(Number)
        startTotalMin = sH * 60 + sM
        endTotalMin   = eH * 60 + eM

        const durationHrs = (endTotalMin - startTotalMin) / 60

        const isPast    = isTodayView && endTotalMin < currentTotalMin
        const isCurrent = isTodayView && startTotalMin <= currentTotalMin && currentTotalMin < endTotalMin

        return {
          blockId,
          subject: block.subject || 'Unknown',
          blockType: block.subjectType || block.type || null,
          color: block.color || '#e5e7eb',
          priority: block.priority || 'medium',
          startTime,
          endTime,
          scheduledHours: durationHrs > 0 ? durationHrs : 1,
          dayOfWeek,
          isFixed: block.isFixed || false,
          log,
          status: log ? log.status : 'pending',
          isToday: isTodayView,
          isPast,
          isCurrent
        }
      })

      set({ todayBlocks, loadingToday: false })
      
      // Also fetch summary
      const sumRes = await fetch(`/api/daily-summaries?timetableId=${timetableId}&date=${date}`)
      if (sumRes.ok) {
        const summary = await sumRes.json()
        set({ dailySummary: summary })
      }
    } catch (error) {
      console.error('Error loading today blocks:', error)
      set({ loadingToday: false, todayBlocks: [] })
    }
  },

  markBlockDone: async (blockId, scheduledDate, rating, energy, notes) => {
    // Optimistic update
    const { todayBlocks } = get()
    const block = todayBlocks.find(b => b.blockId === blockId)
    if (!block) return
    
    // Call API
    await fetch('/api/block-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blockId,
        scheduledDate,
        timetableId: block.log?.timetableId || '', // Passed from component? Actually better if available
        subject: block.subject,
        blockType: block.blockType,
        dayOfWeek: block.dayOfWeek,
        scheduledStart: block.startTime,
        scheduledEnd: block.endTime,
        scheduledHours: block.scheduledHours,
        status: 'completed',
        focusRating: rating,
        energyLevel: energy,
        notes
      })
    })
    trackEvent('block_marked_done', { blockId, subject: block.subject, rating });
  },

  markBlockPartial: async (blockId, scheduledDate, percentage, actualHours, reason, rating) => {
    const { todayBlocks } = get()
    const block = todayBlocks.find(b => b.blockId === blockId)
    if (!block) return
    
    await fetch('/api/block-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blockId,
        scheduledDate,
        subject: block.subject,
        blockType: block.blockType,
        dayOfWeek: block.dayOfWeek,
        scheduledStart: block.startTime,
        scheduledEnd: block.endTime,
        scheduledHours: block.scheduledHours,
        status: 'partial',
        partialPercentage: percentage,
        actualHours,
        skipReason: reason,
        focusRating: rating
      })
    })
  },

  markBlockSkipped: async (blockId, scheduledDate, reason, note) => {
    const { todayBlocks } = get()
    const block = todayBlocks.find(b => b.blockId === blockId)
    if (!block) return
    
    await fetch('/api/block-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blockId,
        scheduledDate,
        subject: block.subject,
        blockType: block.blockType,
        dayOfWeek: block.dayOfWeek,
        scheduledStart: block.startTime,
        scheduledEnd: block.endTime,
        scheduledHours: block.scheduledHours,
        status: 'skipped',
        skipReason: reason,
        skipNote: note
      })
    })
    trackEvent('block_marked_skipped', { blockId, subject: block.subject, reason });
  },

  undoBlockMark: async (blockId, scheduledDate) => {
    // Optimistic update
    const { todayBlocks } = get()
    const block = todayBlocks.find(b => b.blockId === blockId)
    if (!block || !block.log) return
    
    // We would PATCH the log to pending or delete it
    await fetch(`/api/block-logs/${block.log.id}`, {
      method: 'DELETE'
    })
  },

  loadWeeklyAnalytics: async (from, to) => {
    set({ loadingAnalytics: true })
    try {
      const response = await fetch(`/api/analytics?from=${from}&to=${to}`)
      if (response.ok) {
        const data = await response.json()
        set({ weeklyAnalytics: data, analyticsDateRange: { from, to }, loadingAnalytics: false })
      }
    } catch (error) {
       console.error("Failed to load analytics", error)
       set({ loadingAnalytics: false })
    }
  },

  subscribeToTodayUpdates: (userId, date) => {
    const uniqueId = Math.random().toString(36).substring(7);
    const channel = supabase
      .channel(`block-logs-${userId}-${date}-${uniqueId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'block_logs',
          filter: `user_id=eq.${userId}`
        },
        async (payload: any) => {
           // Refetch blocks to update state correctly
           const { todayBlocks, todayDate } = get()
           if (todayDate !== date) return
           
           const newLog = payload.new as BlockLog
           
           if (payload.eventType === 'DELETE') {
              const oldLog = payload.old as any
              set({
                 todayBlocks: todayBlocks.map(b => 
                    b.blockId === (oldLog.blockId || oldLog.block_id) ? { ...b, log: null, status: 'pending' } : b
                 )
              })
           } else if (newLog) {
              const logAny = newLog as any
              set({
                 todayBlocks: todayBlocks.map(b => 
                    b.blockId === (logAny.blockId || logAny.block_id) ? { ...b, log: newLog, status: newLog.status } : b
                 )
              })
           }
        }
      )
      .subscribe()
      
    // Subscribe to daily summaries
    const summaryChannel = supabase
      .channel(`daily-summaries-${userId}-${date}-${uniqueId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_summaries',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
           const newSummary = payload.new as DailySummary
           if (newSummary.date === date) {
              set({ dailySummary: newSummary })
           }
        }
      )
      .subscribe()

    return () => {
       supabase.removeChannel(channel)
       supabase.removeChannel(summaryChannel)
    }
  }
}))
