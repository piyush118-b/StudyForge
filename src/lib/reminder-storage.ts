import type { FiredReminder, ReminderSettings } from '@/types/reminder.types'

const STORAGE_KEY = 'sf_fired_reminders'
const SETTINGS_KEY = 'sf_reminder_settings'

// Key encodes blockId + minutesBefore + date + the exact scheduled-fire minute.
// This means if the user refreshes the page during the 1-minute fire window,
// the dedup check will still return true and no duplicate notification fires.
function buildKey(blockId: string, minutesBefore: number, date: string): string {
  return `${blockId}::${minutesBefore}::${date}`
}

// The scheduled fire minute is the block's start time minus `minutesBefore`.
// This is used to create a tighter, minute-precise dedup key.
function buildPreciseKey(blockId: string, minutesBefore: number, date: string, blockStartTime: string): string {
  const [h, m] = blockStartTime.split(':').map(Number)
  const fireMinute = h * 60 + m - minutesBefore
  return `${blockId}::${minutesBefore}::${date}::${fireMinute}`
}

export const reminderStorage = {
  hasFired(blockId: string, minutesBefore: number, blockStartTime: string): boolean {
    if (typeof window === 'undefined') return false
    
    const today = new Date().toISOString().split('T')[0]
    const preciseKey = buildPreciseKey(blockId, minutesBefore, today, blockStartTime)
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return false
      const fired: FiredReminder[] = JSON.parse(stored)
      // Only match on precise key — avoids false positives from legacy entries
      return fired.some(
        f => f.blockId === blockId && 
             f.minutesBefore === minutesBefore && 
             f.date === today &&
             f.preciseKey === preciseKey
      )
    } catch {
      return false
    }
  },
  
  markFired(blockId: string, minutesBefore: number, blockStartTime: string): void {
    if (typeof window === 'undefined') return
    
    const today = new Date().toISOString().split('T')[0]
    const preciseKey = buildPreciseKey(blockId, minutesBefore, today, blockStartTime)
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const fired: FiredReminder[] = stored ? JSON.parse(stored) : []
      
      fired.push({
        blockId,
        minutesBefore,
        firedAt: new Date().toISOString(),
        date: today,
        preciseKey
      })
      
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 7)
      const cleaned = fired.filter(
        f => new Date(f.firedAt) > cutoff
      )
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
    } catch (err) {
      console.warn('[StudyForge] Failed to mark reminder fired:', err)
    }
  },
  
  getFiredToday(): FiredReminder[] {
    if (typeof window === 'undefined') return []
    const today = new Date().toISOString().split('T')[0]
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []
      const fired: FiredReminder[] = JSON.parse(stored)
      return fired.filter(f => f.date === today)
    } catch {
      return []
    }
  },
  
  clearAll(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  },
  
  saveSettings(settings: ReminderSettings): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch {}
  },
  
  loadSettings(): ReminderSettings | null {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }
}
