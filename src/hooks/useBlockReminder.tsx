'use client'

import { useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { useReminderStore } from '@/store/reminder-store'
import { reminderStorage } from '@/lib/reminder-storage'
import { isSpeechSupported, speakReminder } from '@/lib/reminder-speech'
import { generateReminderMessage, generateNotificationBody, generateVoiceText } from '@/lib/reminder-messages'
import { getTodayBlocks, shouldFireReminder, getNextReminder, isQuietHours, getTodayDayName } from '@/lib/reminder-scheduler'
import type { ReminderBlock, UseBlockReminderReturn, ReminderToastData } from '@/types/reminder.types'
import { ReminderToast } from '@/components/reminders/ReminderToast'

const POLL_INTERVAL_MS = 60 * 1000  // Check every 60 seconds

interface UseBlockReminderOptions {
  blocks: ReminderBlock[]
  studentName?: string
  enabled?: boolean              // default true
}

export function useBlockReminder(
  { blocks, studentName, enabled = true }: UseBlockReminderOptions
): UseBlockReminderReturn {
  
  const {
    settings,
    permission,
    updateSettings,
    setPermission,
    setNextReminder,
    addFiredReminder,
    setVoiceSupported,
    setNotificationSupported
  } = useReminderStore()
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false)
  
  // Keep latest values in refs — the stable interval callback reads these instead
  // of closing over stale values. This prevents the interval from being torn down
  // and recreated every time blocks/settings change.
  const blocksRef = useRef(blocks)
  const settingsRef = useRef(settings)
  const permissionRef = useRef(permission)
  const studentNameRef = useRef(studentName)
  
  blocksRef.current = blocks
  settingsRef.current = settings
  permissionRef.current = permission
  studentNameRef.current = studentName
  
  // Initialize browser capabilities on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Check notification support
    const notifSupported = 'Notification' in window
    setNotificationSupported(notifSupported)
    
    if (notifSupported) {
      setPermission(
        Notification.permission as UseBlockReminderReturn['permission']
      )
    } else {
      setPermission('unsupported')
    }
    
    // Check speech support
    setVoiceSupported(isSpeechSupported())
    
    isInitializedRef.current = true
  }, [setNotificationSupported, setPermission, setVoiceSupported])
  
  // Request notification permission with graceful handling
  const requestPermission = useCallback(async (): Promise<void> => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) {
      setPermission('unsupported')
      toast.error('Browser notifications are not supported on this device.')
      return
    }
    if (Notification.permission === 'granted') {
      setPermission('granted')
      return
    }
    if (Notification.permission === 'denied') {
      setPermission('denied')
      toast.error('Notifications are blocked', {
        description: 'Please click the lock icon in your URL bar to allow notifications.'
      })
      return
    }
    
    setPermission('requesting')
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result === 'granted') {
        updateSettings({ browserNotifications: true })
        toast.success('🔔 Notifications enabled! We\'ll remind you before each block.')
      } else if (result === 'denied') {
        toast.error('Notifications were denied', {
          description: 'You can enable them later by clicking the lock icon in your URL bar.'
        })
      }
    } catch (err) {
      console.warn('[StudyForge] Notification permission error:', err)
      setPermission('default')
      toast.error('Failed to request notifications. Please try again.')
    }
  }, [setPermission, updateSettings])
  
  // All fire functions read from refs — no stale closures, no deps that cause recreation
  const fireBrowserNotification = useCallback((data: ReminderToastData): void => {
    if (permissionRef.current !== 'granted') return
    if (!settingsRef.current.browserNotifications) return
    
    try {
      const notification = new Notification('StudyForge AI ⚡', {
        body: generateNotificationBody(data.subject, data.startTime, data.minutesBefore),
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: `reminder-${data.blockId}-${data.minutesBefore}`,
        // tag prevents duplicate browser notifications
        requireInteraction: false,
        silent: false
      })
      
      // Auto-close after 8 seconds
      setTimeout(() => notification.close(), 8000)
      
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    } catch (err) {
      console.warn('[StudyForge] Browser notification error:', err)
    }
  }, [])
  
  // Fire a premium in-app toast
  const fireToast = useCallback((data: ReminderToastData): void => {
    if (!settingsRef.current.inAppToasts) return
    
    // Dismiss any existing reminder toasts
    toast.dismiss(`reminder-${data.blockId}`)
    
    toast.custom(
      (toastId) => (
        <ReminderToast
          data={data}
          onDismiss={() => toast.dismiss(toastId)}
          onOpenTimetable={() => {
            window.location.href = '/dashboard'
            toast.dismiss(toastId)
          }}
        />
      ),
      {
        id: `reminder-${data.blockId}`,
        duration: data.minutesBefore <= 1 ? 15000 : 30000,
        // 1-min reminder stays longer (more urgent)
        position: 'top-right',
      }
    )
  }, [])
  
  // Fire voice reminder
  const fireVoice = useCallback(async (data: ReminderToastData): Promise<void> => {
    const s = settingsRef.current
    if (!s.voiceReminders) return
    if (!isSpeechSupported()) return
    
    const voiceText = generateVoiceText(
      data.subject,
      data.startTime,
      data.minutesBefore,
      studentNameRef.current
    )
    
    await speakReminder(voiceText, {
      voiceRate: s.voiceRate,
      voicePitch: s.voicePitch,
      voiceVolume: s.voiceVolume,
      preferredVoiceName: s.preferredVoiceName
    })
  }, [])
  
  // The main reminder firing function
  const fireReminder = useCallback(async (
    block: ReminderBlock,
    minutesBefore: number
  ): Promise<void> => {
    const s = settingsRef.current
    // Skip if in quiet hours
    if (isQuietHours(s)) return
    
    // Skip if today not enabled
    if (!s.enabledDays.includes(getTodayDayName() as typeof s.enabledDays[number])) return
    
    // Skip if already fired (primary deduplication)
    if (reminderStorage.hasFired(block.id, minutesBefore, block.startTime)) return
    
    // Mark as fired IMMEDIATELY to prevent race conditions
    reminderStorage.markFired(block.id, minutesBefore, block.startTime)
    
    // Generate the motivational message
    const message = generateReminderMessage(
      block.subject,
      block.startTime,
      minutesBefore,
      s,
      studentNameRef.current
    )
    
    const toastData: ReminderToastData = {
      blockId: block.id,
      subject: block.subject,
      subjectType: block.subjectType,
      minutesBefore,
      startTime: block.startTime,
      color: block.color,
      priority: block.priority,
      message,
      toneStyle: s.toneStyle
    }
    
    // Add to store's firedToday list
    addFiredReminder({
      blockId: block.id,
      minutesBefore,
      firedAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    })
    
    // Fire all channels concurrently
    await Promise.allSettled([
      Promise.resolve(fireToast(toastData)),
      Promise.resolve(fireBrowserNotification(toastData)),
      fireVoice(toastData)
    ])
    
  }, [fireToast, fireBrowserNotification, fireVoice, addFiredReminder])
  
  // Stable tick — reads from refs on every call, never closed over stale data
  const tick = useCallback((): void => {
    if (!enabled) return
    
    const currentBlocks = blocksRef.current
    const currentSettings = settingsRef.current
    
    const todayBlocks = getTodayBlocks(currentBlocks)
    
    // Check primary reminder (5 min)
    for (const block of todayBlocks) {
      if (shouldFireReminder(block, currentSettings.reminderBeforeMinutes)) {
        fireReminder(block, currentSettings.reminderBeforeMinutes)
      }
    }
    
    // Check second reminder (1 min) if enabled
    if (currentSettings.enableSecondReminder) {
      for (const block of todayBlocks) {
        if (shouldFireReminder(block, currentSettings.secondReminderBeforeMinutes)) {
          fireReminder(block, currentSettings.secondReminderBeforeMinutes)
        }
      }
    }
    
    // Update next reminder display
    const next = getNextReminder(todayBlocks, currentSettings)
    setNextReminder(next)
    
  }, [enabled, fireReminder, setNextReminder])
  
  // Mount the interval ONCE on mount. It reads from refs so it never goes stale.
  // It is intentionally NOT in the deps array to avoid teardown/recreate cycles.
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return
    
    // Run immediately
    tick()
    
    // Then every 60 seconds
    intervalRef.current = setInterval(tick, POLL_INTERVAL_MS)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])
  
  // Test function for development / settings preview
  const testReminder = useCallback((block?: Partial<ReminderBlock>): void => {
    const testBlock: ReminderBlock = {
      id: 'test-block',
      subject: block?.subject || 'DSA Revision',
      subjectType: block?.subjectType || 'Revision',
      day: getTodayDayName(),
      startTime: block?.startTime || '09:00',
      endTime: block?.endTime || '11:00',
      color: block?.color || '#6366f1',
      priority: block?.priority || 'High'
    }
    
    // Force fire (bypass deduplication for test)
    reminderStorage.clearAll()
    fireReminder(testBlock, settingsRef.current.reminderBeforeMinutes)
  }, [fireReminder])
  
  return {
    isSupported: permission !== 'unsupported',
    permission,
    requestPermission,
    settings,
    updateSettings,
    nextReminder: useReminderStore(s => s.nextReminder),
    firedToday: reminderStorage.getFiredToday(),
    testReminder
  }
}
