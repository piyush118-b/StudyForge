export interface ReminderSettings {
  browserNotifications: boolean
  inAppToasts: boolean
  voiceReminders: boolean
  soundEffects: boolean
  
  reminderBeforeMinutes: number
  secondReminderBeforeMinutes: number
  enableSecondReminder: boolean
  
  toneStyle: 'motivational' | 'professional' | 'friendly' | 'strict'
  useStudentName: boolean
  
  voiceRate: number
  voicePitch: number
  voiceVolume: number
  preferredVoiceName: string | null
  
  soundType: 'bell' | 'chime' | 'digital' | 'soft'
  soundVolume: number
  
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
  
  enabledDays: ('Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'|'Sunday')[]
  
  pushSubscriptionEndpoint: string | null
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  browserNotifications: true,
  inAppToasts: true,
  voiceReminders: true,
  soundEffects: true,
  reminderBeforeMinutes: 5,
  secondReminderBeforeMinutes: 1,
  enableSecondReminder: false,
  toneStyle: 'motivational',
  useStudentName: true,
  voiceRate: 0.9,
  voicePitch: 1.0,
  voiceVolume: 0.8,
  preferredVoiceName: null,
  soundType: 'chime',
  soundVolume: 0.6,
  quietHoursEnabled: false,
  quietHoursStart: '23:00',
  quietHoursEnd: '07:00',
  enabledDays: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
  pushSubscriptionEndpoint: null
}

export interface ReminderBlock {
  id: string
  subject: string
  subjectType: string
  day: string
  startTime: string
  endTime: string
  color: string
  priority: 'High' | 'Medium' | 'Low' | null
  notes?: string
}

export interface FiredReminder {
  blockId: string
  minutesBefore: number
  firedAt: string
  date: string
  preciseKey?: string  // minute-precise dedup key — prevents duplicate fires on page refresh
}

export interface UseBlockReminderReturn {
  isSupported: boolean
  permission: NotificationPermission | 'unsupported' | 'requesting' | 'default'
  requestPermission: () => Promise<void>
  settings: ReminderSettings
  updateSettings: (partial: Partial<ReminderSettings>) => void
  nextReminder: ScheduledReminder | null
  firedToday: FiredReminder[]
  testReminder: (block?: Partial<ReminderBlock>) => void
}

export interface ScheduledReminder {
  block: ReminderBlock
  minutesBefore: number
  scheduledFor: Date
  timeUntilMs: number
}

export interface ReminderToastData {
  blockId: string
  subject: string
  subjectType: string
  minutesBefore: number
  startTime: string
  color: string
  priority: 'High' | 'Medium' | 'Low' | null
  message: string
  toneStyle: ReminderSettings['toneStyle']
}

export type NotificationPermissionState = 
  | 'granted' 
  | 'denied' 
  | 'default' 
  | 'unsupported'
  | 'requesting'
