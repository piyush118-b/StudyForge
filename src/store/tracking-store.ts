import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { storeLifecycle } from '@/lib/store/lifecycle'
import { 
  BlockLog, 
  DailySummary, 
  WeeklyAnalytics, 
  BlockWithLog, 
  BlockStatus, 
  EnergyLevel, 
  SkipReason 
} from '@/types/tracking.types'
import { TrackingBlock } from '@/types';
import { getLocalDateStr } from '@/lib/time-utils'

interface TrackingState {
  // Today's blocks (from active timetable)
  todayBlocks: BlockWithLog[]
  todayDate: string
  activeTimetableId: string | null
  
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
  
  // Shared optimistic updater
  updateBlockStatus: (
    id: string, 
    status: BlockStatus, 
    payload: any
  ) => Promise<void>
  
  // Real-time updates
  subscribeToTodayUpdates: (userId: string, date: string) => () => void
}

export const useTrackingStore = create<TrackingState>((set, get) => ({
  todayBlocks: [],
  todayDate: getLocalDateStr(),
  activeTimetableId: null,
  dailySummary: null,
  loadingToday: false,
  loadingAnalytics: false,
  weeklyAnalytics: null,
  analyticsDateRange: { from: '', to: '' },

  loadTodayBlocks: async (timetableId, gridData, date) => {
    // Immediately clear STALE blocks so yesterday's data never flashes on screen
    set({ loadingToday: true, todayDate: date, activeTimetableId: timetableId, todayBlocks: [], dailySummary: null })
    try {
      const response = await fetch(`/api/block-logs?timetableId=${timetableId}&date=${date}`)
      if (!response.ok) throw new Error('Failed to fetch block logs')
      const logs: BlockLog[] = await response.json()
      
      // Use noon UTC to compute day-of-week — avoids any timezone offset flipping the date
      const dateObj = new Date(date + 'T12:00:00Z')
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
      const dayId = `col_${dayOfWeek.toLowerCase()}`
      
      console.log(`[TrackingStore] Loading blocks for ${date} → ${dayOfWeek} (dayId: ${dayId})`)
      // Support both old format (dayId: 'col_saturday') and new format (day: 'Saturday')
      let blocks: any[] = []
      if (gridData && typeof gridData === 'object' && !Array.isArray(gridData)) {
        const allBlocks = Object.values(gridData) as any[]
        // Debug: show what days actually exist in the grid
        const availableDays = [...new Set(allBlocks.map((b: any) => b.day || b.dayId || '?'))]
        console.log(`[TrackingStore] Grid has ${allBlocks.length} total blocks across days:`, availableDays)
        
        blocks = allBlocks.filter((b: any) => {
          const bDay = typeof b.day === 'string' ? b.day.toLowerCase() : '';
          const bId = typeof b.dayId === 'string' ? b.dayId.toLowerCase() : '';
          const targetDayName = dayOfWeek.toLowerCase();
          const targetColId = dayId; // e.g. col_saturday

          return bId === targetColId || bId === targetDayName || bDay === targetDayName || bDay === targetColId;
        })
        console.log(`[TrackingStore] Matched ${blocks.length} blocks for ${dayOfWeek}`)
      }
      
      const now = new Date()
      const currentTotalMin = now.getHours() * 60 + now.getMinutes()
      const isTodayView = date === getLocalDateStr()

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

  updateBlockStatus: async (id, status, payload) => {
    const { todayBlocks } = get()
    const blockIndex = todayBlocks.findIndex(b => b.blockId === id)
    if (blockIndex === -1) return
    
    const prevBlock = todayBlocks[blockIndex]
    
    // 1. Optimistic Update
    const updatedBlocks = [...todayBlocks]
    updatedBlocks[blockIndex] = { ...prevBlock, status, log: { ...prevBlock.log, ...payload } as any }
    set({ todayBlocks: updatedBlocks })
    
    try {
      // 2. Network Sync via dedicated API 
      // We use /api/block-logs instead of batch sync because it triggers analytics triggers
      // (daily summary recalculation) immediately.
      const response = await fetch('/api/block-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          blockId: id, // Explicitly pass blockId as expected by API
          status, 
          ...payload 
        })
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to sync tracking data')
      }
      
      // 3. Lifecycle hooks
      storeLifecycle.onBlockTracked({
        ...prevBlock,
        id: prevBlock.blockId,
        day: prevBlock.dayOfWeek as any,
        timetableId: payload.timetableId || '',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status
      } as TrackingBlock)
      
    } catch (err) {
      console.error(err);
      // Rollback
      const revertBlocks = [...todayBlocks]
      revertBlocks[blockIndex] = prevBlock
      set({ todayBlocks: revertBlocks })
      // toast.error('Failed to save — try again') would be imported if needed
    }
  },

  markBlockDone: async (blockId, scheduledDate, rating, energy, notes) => {
    const { todayBlocks } = get()
    const block = todayBlocks.find(b => b.blockId === blockId)
    if (!block) return
    
    await get().updateBlockStatus(blockId, 'completed', {
      scheduledDate,
      timetableId: block.log?.timetableId || get().activeTimetableId || undefined,
      subject: block.subject,
      blockType: block.blockType,
      dayOfWeek: block.dayOfWeek,
      scheduledStart: block.startTime,
      scheduledEnd: block.endTime,
      scheduledHours: block.scheduledHours,
      focusRating: rating,
      energyLevel: energy,
      notes
    })
  },

  markBlockPartial: async (blockId, scheduledDate, percentage, actualHours, reason, rating) => {
    const { todayBlocks } = get()
    const block = todayBlocks.find(b => b.blockId === blockId)
    if (!block) return
    
    await get().updateBlockStatus(blockId, 'partial', {
      scheduledDate,
      timetableId: block.log?.timetableId || get().activeTimetableId || undefined,
      subject: block.subject,
      blockType: block.blockType,
      dayOfWeek: block.dayOfWeek,
      scheduledStart: block.startTime,
      scheduledEnd: block.endTime,
      scheduledHours: block.scheduledHours,
      partialPercentage: percentage,
      actualHours,
      skipReason: reason,
      focusRating: rating
    })
  },

  markBlockSkipped: async (blockId, scheduledDate, reason, note) => {
    const { todayBlocks } = get()
    const block = todayBlocks.find(b => b.blockId === blockId)
    if (!block) return
    
    await get().updateBlockStatus(blockId, 'skipped', {
      scheduledDate,
      timetableId: block.log?.timetableId || get().activeTimetableId || undefined,
      subject: block.subject,
      blockType: block.blockType,
      dayOfWeek: block.dayOfWeek,
      scheduledStart: block.startTime,
      scheduledEnd: block.endTime,
      scheduledHours: block.scheduledHours,
      skipReason: reason,
      skipNote: note
    })
  },

  undoBlockMark: async (blockId, scheduledDate) => {
    const { todayBlocks } = get()
    const blockIndex = todayBlocks.findIndex(b => b.blockId === blockId)
    if (blockIndex === -1) return
    
    const prevBlock = todayBlocks[blockIndex]
    if (!prevBlock.log) return
    
    const updatedBlocks = [...todayBlocks]
    updatedBlocks[blockIndex] = { ...prevBlock, status: 'pending', log: null }
    set({ todayBlocks: updatedBlocks })
    
    try {
      await fetch(`/api/block-logs/${prevBlock.log.id}`, { method: 'DELETE' })
    } catch {
      const revertBlocks = [...todayBlocks]
      revertBlocks[blockIndex] = prevBlock
      set({ todayBlocks: revertBlocks })
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
