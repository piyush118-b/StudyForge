export type BlockStatus = 'pending' | 'completed' | 'partial' | 'skipped'
export type EnergyLevel = 'high' | 'medium' | 'low'
export type SkipReason = 'tired' | 'distracted' | 'emergency' | 'unwell' | 
                         'plan_changed' | 'other'

export interface BlockLog {
  id: string
  userId: string
  timetableId: string
  blockId: string
  subject: string
  blockType: string | null
  dayOfWeek: string
  scheduledDate: string           // 'YYYY-MM-DD'
  scheduledStart: string          // 'HH:MM'
  scheduledEnd: string            // 'HH:MM'
  scheduledHours: number
  status: BlockStatus
  actualHours: number
  partialPercentage: number
  skipReason: SkipReason | null
  skipNote: string | null
  focusRating: number | null      // 1-5
  energyLevel: EnergyLevel | null
  notes: string | null
  markedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DailySummary {
  id: string
  userId: string
  timetableId: string
  date: string
  totalBlocks: number
  completedBlocks: number
  partialBlocks: number
  skippedBlocks: number
  pendingBlocks: number
  scheduledHours: number
  completedHours: number
  partialHours: number
  completionRate: number
  focusAvg: number | null
  subjectBreakdown: SubjectDayBreakdown[]
}

export interface SubjectDayBreakdown {
  subject: string
  scheduled: number               // hours
  completed: number
  status: BlockStatus
}

export interface WeeklyAnalytics {
  weekStart: string
  weekEnd: string
  dailySummaries: DailySummary[]
  
  // Totals
  totalScheduledHours: number
  totalCompletedHours: number
  totalPartialHours: number
  overallCompletionRate: number   // 0-100
  
  // Streaks
  currentStreak: number
  longestStreak: number
  
  // Per-subject
  subjectStats: SubjectWeeklyStat[]
  
  // Patterns
  bestDay: string                 // 'Monday' (highest completion)
  worstDay: string
  bestTimeSlot: string            // '9AM-11AM' (most completions)
  mostSkippedSubject: string | null
  mostCompletedSubject: string | null
  
  // Skip analysis
  skipReasonBreakdown: {
    reason: SkipReason
    count: number
    percentage: number
  }[]
}

export interface SubjectWeeklyStat {
  subject: string
  color: string
  scheduledHours: number
  completedHours: number
  partialHours: number
  skippedCount: number
  completionRate: number          // 0-100
  trend: 'improving' | 'declining' | 'stable'
}

export interface GuestBlockLogs {
  logs: BlockLog[]
  dailySummaries: DailySummary[]
  lastUpdated: string
}

export interface BlockWithLog {
  // From timetable grid
  blockId: string
  subject: string
  blockType: string
  color: string
  priority: string
  startTime: string
  endTime: string
  scheduledHours: number
  dayOfWeek: string
  isFixed: boolean
  
  // From block_logs (null if not yet marked)
  log: BlockLog | null
  
  // Computed
  status: BlockStatus
  isToday: boolean
  isPast: boolean
  isCurrent: boolean
}
