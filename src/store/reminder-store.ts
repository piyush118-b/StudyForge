import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ReminderSettings, FiredReminder, ScheduledReminder } from '@/types/reminder.types'
import { DEFAULT_REMINDER_SETTINGS } from '@/types/reminder.types'

interface ReminderStore {
  settings: ReminderSettings
  permission: 'granted' | 'denied' | 'default' | 'unsupported' | 'requesting'
  nextReminder: ScheduledReminder | null
  firedToday: FiredReminder[]
  isVoiceSupported: boolean
  isNotificationSupported: boolean
  
  updateSettings: (partial: Partial<ReminderSettings>) => void
  setPermission: (p: ReminderStore['permission']) => void
  setNextReminder: (r: ScheduledReminder | null) => void
  addFiredReminder: (f: FiredReminder) => void
  clearFiredToday: () => void
  setVoiceSupported: (v: boolean) => void
  setNotificationSupported: (v: boolean) => void
  resetSettings: () => void
}

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_REMINDER_SETTINGS,
      permission: 'default',
      nextReminder: null,
      firedToday: [],
      isVoiceSupported: false,
      isNotificationSupported: false,
      
      updateSettings: (partial) => set(state => ({
        settings: { ...state.settings, ...partial }
      })),
      
      setPermission: (permission) => set({ permission }),
      
      setNextReminder: (nextReminder) => set(state => {
        if (!state.nextReminder && !nextReminder) return state
        if (state.nextReminder && nextReminder) {
          if (
            state.nextReminder.block.id === nextReminder.block.id &&
            state.nextReminder.minutesBefore === nextReminder.minutesBefore &&
            state.nextReminder.timeUntilMs === nextReminder.timeUntilMs
          ) {
            return state // Prevent infinite loops by returning identical state reference
          }
        }
        return { nextReminder }
      }),
      
      addFiredReminder: (f) => set(state => ({
        firedToday: [...state.firedToday.filter(
          r => !(r.blockId === f.blockId && r.minutesBefore === f.minutesBefore)
        ), f]
      })),
      
      clearFiredToday: () => set({ firedToday: [] }),
      
      setVoiceSupported: (isVoiceSupported) => set({ isVoiceSupported }),
      
      setNotificationSupported: (isNotificationSupported) => 
        set({ isNotificationSupported }),
      
      resetSettings: () => set({ settings: DEFAULT_REMINDER_SETTINGS })
    }),
    {
      name: 'sf_reminder_store',
      partialize: (state) => ({
        settings: state.settings,
        permission: state.permission
      })
    }
  )
)
