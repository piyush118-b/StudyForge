'use client'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Bell, Volume2, Mic, Clock } from 'lucide-react'
import { useReminderStore } from '@/store/reminder-store'
import { useBlockReminder } from '@/hooks/useBlockReminder'
import { generateReminderMessage } from '@/lib/reminder-messages'
import { DEFAULT_REMINDER_SETTINGS, ReminderBlock } from '@/types/reminder.types'
import { ReminderPermissionCard } from './ReminderPermissionCard'
import React from 'react'

interface Props {
  open: boolean
  onClose: () => void
  blocks: ReminderBlock[]
  studentName?: string
}

export function ReminderSettingsPanel({ open, onClose, blocks, studentName }: Props) {
  const { settings, permission } = useReminderStore()
  const { updateSettings, testReminder, requestPermission } = useBlockReminder({ blocks, studentName })
  
  const previewMessage = generateReminderMessage(
    'DSA Revision',
    '09:00',
    settings.reminderBeforeMinutes,
    settings,
    studentName
  )
  
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-[380px] bg-slate-950/95 border-white/10 
          backdrop-blur-xl overflow-y-auto"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-white">
            <Bell size={16} className="text-indigo-400" />
            Reminder Settings
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6">
          
          {permission !== 'granted' && (
            <ReminderPermissionCard compact />
          )}
          
          <SettingsSection title="Notification Channels" icon={Bell}>
            <ToggleRow
              label="In-App Toasts"
              description="Premium notifications inside the app"
              checked={settings.inAppToasts}
              onChange={v => updateSettings({ inAppToasts: v })}
            />
            <ToggleRow
              label="Browser Notifications"
              description="Even when app is minimized"
              checked={settings.browserNotifications && permission === 'granted'}
              onChange={v => {
                if (v && permission !== 'granted') {
                  requestPermission()
                } else {
                  updateSettings({ browserNotifications: v })
                }
              }}
            />
            <ToggleRow
              label="Voice Reminders"
              description="Browser speech synthesis"
              checked={settings.voiceReminders}
              onChange={v => updateSettings({ voiceReminders: v })}
            />
          </SettingsSection>
          
          <SettingsSection title="Timing" icon={Clock}>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-[13px] text-white/60">
                  Remind me before
                </Label>
                <span className="text-[13px] font-semibold text-white">
                  {settings.reminderBeforeMinutes} min
                </span>
              </div>
              <Slider
                min={1}
                max={15}
                step={1}
                value={[settings.reminderBeforeMinutes]}
                onValueChange={(val) => updateSettings({ reminderBeforeMinutes: Array.isArray(val) ? val[0] : (val as any)[0] || 5 })}
                className="reminder-slider"
              />
              <div className="flex justify-between text-[10px] text-white/20">
                <span>1 min</span>
                <span>15 min</span>
              </div>
            </div>
            
            <ToggleRow
              label="Final 1-min warning"
              description="Second reminder right before block starts"
              checked={settings.enableSecondReminder}
              onChange={v => updateSettings({ enableSecondReminder: v })}
            />
          </SettingsSection>
          
          <SettingsSection title="Message Tone" icon={Volume2}>
            <div className="grid grid-cols-2 gap-2">
              {(['motivational','professional','friendly','strict'] as const).map(tone => (
                <button
                  key={tone}
                  onClick={() => updateSettings({ toneStyle: tone })}
                  className={`
                    p-2.5 rounded-xl text-[12px] font-medium capitalize
                    border transition-all duration-150
                    ${settings.toneStyle === tone
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/8'
                    }
                  `}
                >
                  {tone}
                </button>
              ))}
            </div>
            
            <div className="p-3 rounded-xl bg-white/5 border border-white/8 mt-2">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">
                Preview
              </p>
              <p className="text-[12px] text-white/60 italic leading-relaxed">
                "{previewMessage}"
              </p>
            </div>
          </SettingsSection>
          
          <SettingsSection title="Quiet Hours" icon={Clock}>
            <ToggleRow
              label="Enable quiet hours"
              description="No reminders during these hours"
              checked={settings.quietHoursEnabled}
              onChange={v => updateSettings({ quietHoursEnabled: v })}
            />
            {settings.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <Label className="text-[11px] text-white/40 mb-1 block">
                    Start
                  </Label>
                  <input
                    type="time"
                    value={settings.quietHoursStart}
                    onChange={e => updateSettings({ quietHoursStart: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg
                      px-3 py-2 text-[13px] text-white/70
                      focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-white/40 mb-1 block">
                    End
                  </Label>
                  <input
                    type="time"
                    value={settings.quietHoursEnd}
                    onChange={e => updateSettings({ quietHoursEnd: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg
                      px-3 py-2 text-[13px] text-white/70
                      focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>
            )}
          </SettingsSection>
          
          <div className="pt-2">
            <button
              onClick={() => testReminder()}
              className="w-full py-3 rounded-xl border border-dashed 
                border-white/15 text-white/40 hover:border-indigo-500/40
                hover:text-indigo-300 text-[13px] transition-all duration-200
                hover:bg-indigo-500/5"
            >
              🔔 Test Reminder Now
            </button>
          </div>
          
        </div>
      </SheetContent>
    </Sheet>
  )
}

function SettingsSection({ 
  title, children, icon: Icon 
}: { 
  title: string
  children: React.ReactNode
  icon: React.ElementType
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={13} className="text-white/30" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
          {title}
        </span>
      </div>
      <div className="space-y-3 pl-5">
        {children}
      </div>
    </div>
  )
}

function ToggleRow({ 
  label, description, checked, onChange, disabled 
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className={`flex items-center justify-between gap-4 
      ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div>
        <p className="text-[13px] text-white/70 font-medium">{label}</p>
        {description && (
          <p className="text-[11px] text-white/30 mt-0.5">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-indigo-500"
      />
    </div>
  )
}
