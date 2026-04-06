"use client";

import { usePomodoroStore } from '@/store/pomodoro-store';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { BellRing, Check, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

export function PomodoroSettings({ open, onClose }: SettingsProps) {
  const store = usePomodoroStore();
  const [lcl, setLcl] = useState(store.config);

  const save = () => {
    store.updateConfig(lcl);
    toast.success('Settings saved');
    onClose();
  };

  const soundOptions: { val: typeof lcl.selectedSound; label: string }[] = [
    { val: 'bell', label: 'Classic Bell' },
    { val: 'digital', label: 'Digital Beep' },
    { val: 'soft', label: 'Soft Chime' },
    { val: 'none', label: 'Silent' }
  ];

  const inputCls = "w-full bg-[#222222] border border-[#2A2A2A] text-[#F0F0F0] font-mono text-sm rounded-lg h-9 px-3 text-center focus:outline-none focus:ring-2 focus:ring-[#10B981]/70 focus:border-[#10B981]/50 hover:border-[#333333] transition-all duration-150-all duration-150";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[400px] z-[99999] bg-[#0A0A0A] border-[#2A2A2A] p-6 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-lg font-bold flex items-center gap-2 text-[#F0F0F0]">
            <span className="bg-[rgba(16,185,129,0.1)] text-[#10B981] p-1.5 rounded-lg border border-[#10B981]/20">
              <BellRing className="w-5 h-5" />
            </span>
            Timer Settings
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">

          {/* Durations */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#606060]">Durations</h3>

            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 space-y-4">
              {[
                { label: 'Focus', key: 'focusMinutes', min: 1, max: 120, value: lcl.focusMinutes, onChange: (v: number) => setLcl(s => ({ ...s, focusMinutes: v })) },
                { label: 'Short Break', key: 'shortBreakMinutes', min: 1, max: 30, value: lcl.shortBreakMinutes, onChange: (v: number) => setLcl(s => ({ ...s, shortBreakMinutes: v })) },
                { label: 'Long Break', key: 'longBreakMinutes', min: 1, max: 60, value: lcl.longBreakMinutes, onChange: (v: number) => setLcl(s => ({ ...s, longBreakMinutes: v })) },
                { label: 'Sessions Before Long Break', key: 'sessionsBeforeLongBreak', min: 1, max: 10, value: lcl.sessionsBeforeLongBreak, onChange: (v: number) => setLcl(s => ({ ...s, sessionsBeforeLongBreak: v })) },
              ].map(({ label, key, min, max, value, onChange }) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#606060]">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min={min} max={max}
                      value={value}
                      onChange={(e) => onChange(Number(e.target.value))}
                      className="w-16 h-8 px-2 bg-[#222222] border border-[#2A2A2A] rounded-lg text-sm text-[#F0F0F0] font-mono text-center focus:outline-none focus:ring-2 focus:ring-[#10B981]/70 hover:border-[#333333] transition-all duration-150-all duration-150"
                    />
                    <span className="text-xs text-[#606060]">min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#2A2A2A]" />

          {/* Automation */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#606060]">Automation</h3>

            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl divide-y divide-[#2A2A2A]">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-[#F0F0F0]">Auto-start Breaks</p>
                  <p className="text-xs text-[#606060] mt-0.5">Timer starts automatically when focus ends</p>
                </div>
                <Switch checked={lcl.autoStartBreaks} onCheckedChange={(v) => setLcl(s => ({ ...s, autoStartBreaks: v }))} />
              </div>

              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-[#F0F0F0]">Auto-start Focus</p>
                  <p className="text-xs text-[#606060] mt-0.5">Timer starts automatically when break ends</p>
                </div>
                <Switch checked={lcl.autoStartFocus} onCheckedChange={(v) => setLcl(s => ({ ...s, autoStartFocus: v }))} />
              </div>
            </div>
          </div>

          <div className="h-px bg-[#2A2A2A]" />

          {/* Sound */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#606060]">Sound & Alerts</h3>

            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#F0F0F0]">Sound Enabled</p>
                <Switch checked={lcl.soundEnabled} onCheckedChange={(v) => setLcl(s => ({ ...s, soundEnabled: v }))} />
              </div>

              {lcl.soundEnabled && (
                <div className="space-y-3 pt-2 border-t border-[#2A2A2A]">
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#606060]">Alert Sound</label>
                  <div className="grid grid-cols-2 gap-2">
                    {soundOptions.map((opt) => (
                      <button key={opt.val} onClick={() => setLcl(s => ({ ...s, selectedSound: opt.val }))}
                        className={`text-xs px-3 py-2 rounded-lg border text-left flex items-center justify-between transition-all duration-150-all duration-150 ${
                          lcl.selectedSound === opt.val
                            ? 'bg-[rgba(16,185,129,0.1)] border-[#10B981]/30 text-[#10B981] font-semibold'
                            : 'bg-[#222222] border-[#2A2A2A] text-[#A0A0A0] hover:bg-[#2A2A2A] hover:text-[#F0F0F0]'}`}>
                        {opt.label}
                        {lcl.selectedSound === opt.val && <Check className="w-3.5 h-3.5 text-[#10B981]" />}
                      </button>
                    ))}
                  </div>

                  {lcl.selectedSound !== 'none' && (
                    <div className="space-y-2 pt-3 border-t border-[#2A2A2A]">
                      <div className="flex justify-between">
                        <label className="text-xs text-[#606060]">Volume</label>
                        <span className="text-xs text-[#A0A0A0] font-mono">{Math.round(lcl.soundVolume * 100)}%</span>
                      </div>
                      <input type="range" min="0" max="1" step="0.1" value={lcl.soundVolume}
                        onChange={(e) => setLcl(s => ({ ...s, soundVolume: Number(e.target.value) }))}
                        className="w-full accent-[#10B981]" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="mt-8 pt-4 flex gap-3 border-t border-[#2A2A2A] sticky bottom-0 bg-[#0A0A0A]">
          <button onClick={onClose}
            className="flex-1 h-9 rounded-lg border border-[#2A2A2A] bg-transparent text-sm font-medium text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-[#F0F0F0] hover:border-[#333333] transition-all duration-150-all duration-150 active:scale-[0.97]">
            Cancel
          </button>
          <button onClick={save}
            className="flex-1 h-9 rounded-lg bg-[#10B981] text-[#0A0A0A] text-sm font-bold shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_16px_rgba(16,185,129,0.15)] hover:bg-[#34D399] transition-all duration-150-all duration-150 active:scale-[0.97] flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Apply
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
