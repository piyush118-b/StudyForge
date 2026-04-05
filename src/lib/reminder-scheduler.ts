import type { ReminderBlock, ScheduledReminder, ReminderSettings } from '@/types/reminder.types'

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function nowToMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

export function to12Hour(time24: string): string {
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

export function getTodayDayName(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' })
}

export function isQuietHours(settings: ReminderSettings): boolean {
  if (!settings.quietHoursEnabled) return false
  
  const nowMins = nowToMinutes()
  const startMins = timeToMinutes(settings.quietHoursStart)
  const endMins = timeToMinutes(settings.quietHoursEnd)
  
  if (startMins > endMins) {
    return nowMins >= startMins || nowMins < endMins
  }
  return nowMins >= startMins && nowMins < endMins
}

export function getTodayBlocks(blocks: ReminderBlock[]): ReminderBlock[] {
  const today = getTodayDayName()
  return blocks.filter(b => b.day === today)
}

export function getNextReminder(
  blocks: ReminderBlock[],
  settings: ReminderSettings
): ScheduledReminder | null {
  const todayBlocks = getTodayBlocks(blocks)
  const nowMins = nowToMinutes()
  
  let closest: ScheduledReminder | null = null
  let closestDiff = Infinity
  
  for (const block of todayBlocks) {
    const blockStartMins = timeToMinutes(block.startTime)
    
    for (const minutesBefore of [
      settings.reminderBeforeMinutes,
      ...(settings.enableSecondReminder ? [settings.secondReminderBeforeMinutes] : [])
    ]) {
      const reminderMins = blockStartMins - minutesBefore
      const diff = reminderMins - nowMins
      
      if (diff > 0 && diff < closestDiff) {
        closestDiff = diff
        
        const scheduledFor = new Date()
        scheduledFor.setHours(Math.floor(reminderMins / 60))
        scheduledFor.setMinutes(reminderMins % 60)
        scheduledFor.setSeconds(0)
        scheduledFor.setMilliseconds(0)
        
        closest = {
          block,
          minutesBefore,
          scheduledFor,
          timeUntilMs: diff * 60 * 1000
        }
      }
    }
  }
  
  return closest
}

export function shouldFireReminder(
  block: ReminderBlock,
  minutesBefore: number
): boolean {
  const nowMins = nowToMinutes()
  const blockStartMins = timeToMinutes(block.startTime)
  const reminderMins = blockStartMins - minutesBefore
  
  const diff = nowMins - reminderMins
  // Allow firing exactly on the minute, or up to 1 minute late (in case the 60s interval drifted)
  return diff >= 0 && diff <= 1
}
