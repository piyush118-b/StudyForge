'use client'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Bell, Volume2, Mic, Clock, Settings2 } from 'lucide-react'
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
        className="w-[400px] bg-[#111111] border-l border-[#2A2A2A] 
          overflow-y-auto px-6 py-8 shadow-2xl"
      >
        <SheetHeader className="mb-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
                <Settings2 size={18} className="text-[#F0F0F0]" />
             </div>
             <div>
                <SheetTitle className="text-[#F0F0F0] text-xl font-bold tracking-tight">
                  Reminders
                </SheetTitle>
                <p className="text-[11px] text-[#8A8A8A] font-semibold uppercase tracking-widest mt-0.5">Preferences</p>
             </div>
          </div>
        </SheetHeader>
        
        <div className="space-y-10">
          
          {permission !== 'granted' && (
            <div className="mb-2 scale-95 origin-left">
              <ReminderPermissionCard compact />
            </div>
          )}
          
          <SettingsSection title="Notification Channels" icon={Bell}>
            <div className="space-y-5">
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
            </div>
          </SettingsSection>
          
          <SettingsSection title="Timing" icon={Clock}>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-[12px] text-[#A0A0A0] font-semibold">
                    Buffer Time
                  </Label>
                  <div className="px-2.5 py-0.5 rounded-md bg-[#1A1A1A] border border-[#2A2A2A]">
                    <span className="text-[12px] font-bold text-[#10B981] tabular-nums">
                      {settings.reminderBeforeMinutes}m
                    </span>
                  </div>
                </div>
                
                <div className="px-2">
                  <Slider
                    min={1}
                    max={15}
                    step={1}
                    value={[settings.reminderBeforeMinutes]}
                    onValueChange={(val) => updateSettings({ reminderBeforeMinutes: Array.isArray(val) ? val[0] : (val as any)[0] || 5 })}
                    className="reminder-slider"
                  />
                  <div className="flex justify-between text-[10px] text-[#606060] font-semibold mt-3">
                    <span>1 MIN</span>
                    <span>15 MIN</span>
                  </div>
                </div>
              </div>
              
              <ToggleRow
                label="Final 1-min warning"
                description="Second reminder right before block starts"
                checked={settings.enableSecondReminder}
                onChange={v => updateSettings({ enableSecondReminder: v })}
              />
            </div>
          </SettingsSection>
          
          <SettingsSection title="Message Tone" icon={Volume2}>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2">
                {(['motivational','professional','friendly','strict'] as const).map(tone => (
                  <button
                    key={tone}
                    onClick={() => updateSettings({ toneStyle: tone })}
                    className={`
                      py-2.5 rounded-lg text-[12px] font-medium capitalize
                      border transition-all duration-200
                      ${settings.toneStyle === tone
                        ? 'bg-[rgba(16,185,129,0.08)] border-[#10B981]/30 text-[#10B981]'
                        : 'bg-[#1A1A1A] border-[#2A2A2A] text-[#8A8A8A] hover:bg-[#222222] hover:text-[#F0F0F0]'
                      }
                    `}
                  >
                    {tone}
                  </button>
                ))}
              </div>
              
              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#222222]">
                <p className="text-[10px] text-[#606060] font-semibold tracking-widest uppercase mb-2">
                  Live Preview
                </p>
                <p className="text-[13px] text-[#A0A0A0] leading-relaxed">
                  "{previewMessage}"
                </p>
              </div>
            </div>
          </SettingsSection>
          
          <SettingsSection title="Quiet Hours" icon={Clock}>
            <div className="space-y-5">
              <ToggleRow
                label="Enable quiet hours"
                description="No reminders during these hours"
                checked={settings.quietHoursEnabled}
                onChange={v => updateSettings({ quietHoursEnabled: v })}
              />
              {settings.quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-3 mt-1 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-[#606060] font-semibold uppercase tracking-widest ml-0.5">
                      Start
                    </Label>
                    <input
                      type="time"
                      value={settings.quietHoursStart}
                      onChange={e => updateSettings({ quietHoursStart: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg
                        px-3 py-2 text-[13px] text-[#F0F0F0]
                        focus:outline-none focus:border-[#10B981]/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-[#606060] font-semibold uppercase tracking-widest ml-0.5">
                      End
                    </Label>
                    <input
                      type="time"
                      value={settings.quietHoursEnd}
                      onChange={e => updateSettings({ quietHoursEnd: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg
                        px-3 py-2 text-[13px] text-[#F0F0F0]
                        focus:outline-none focus:border-[#10B981]/50 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
          </SettingsSection>
          
          <div className="pt-4 pb-2">
            <button
              onClick={() => testReminder()}
              className="w-full py-3 rounded-lg border border-[#2A2A2A] 
                bg-[#1A1A1A] text-[#F0F0F0] hover:bg-[#222222] hover:border-[#333333]
                text-[13px] font-medium transition-all duration-200
                flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Bell size={14} className="text-[#A0A0A0]" />
              Send Test Reminder
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-[#8A8A8A]" />
        <span className="text-xs font-semibold text-[#8A8A8A] tracking-wide">
          {title}
        </span>
        <div className="flex-1 h-px bg-[#2A2A2A] ml-2" />
      </div>
      <div className="pl-1">
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
    <div className={`flex items-center justify-between gap-6 
      ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex-1">
        <p className="text-[14px] text-[#F0F0F0] font-medium mb-0.5">{label}</p>
        {description && (
          <p className="text-[12px] text-[#8A8A8A] leading-relaxed">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-[#10B981] scale-[0.85]"
      />
    </div>
  )
}
