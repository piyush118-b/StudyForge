"use client";

import { usePomodoroStore } from '@/store/pomodoro-store';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
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

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[400px] z-[99999] bg-slate-950 border-slate-800 p-6 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold flex items-center gap-2 text-white">
            <span className="bg-indigo-500/10 text-indigo-400 p-1.5 rounded-lg border border-indigo-500/20">
              <BellRing className="w-5 h-5" />
            </span>
            Timer Settings
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-1">Durations (minutes)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs shadow-none border-none">Focus Time</Label>
                <Input type="number" min={1} max={120} value={lcl.focusMinutes} onChange={(e) => setLcl(s => ({ ...s, focusMinutes: Number(e.target.value) }))} className="bg-slate-900 border-slate-800 transition-colors focus:border-indigo-500 h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs shadow-none border-none">Short Break</Label>
                <Input type="number" min={1} max={30} value={lcl.shortBreakMinutes} onChange={(e) => setLcl(s => ({ ...s, shortBreakMinutes: Number(e.target.value) }))} className="bg-slate-900 border-slate-800 transition-colors focus:border-indigo-500 h-9" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs shadow-none border-none">Long Break</Label>
                <Input type="number" min={1} max={60} value={lcl.longBreakMinutes} onChange={(e) => setLcl(s => ({ ...s, longBreakMinutes: Number(e.target.value) }))} className="bg-slate-900 border-slate-800 transition-colors focus:border-indigo-500 h-9" />
              </div>
              <div className="space-y-1.5 flex flex-col justify-end">
                 <Label className="text-slate-300 text-xs shadow-none border-none truncate">Rounds before Long Brk</Label>
                 <Input type="number" min={1} max={10} value={lcl.sessionsBeforeLongBreak} onChange={(e) => setLcl(s => ({ ...s, sessionsBeforeLongBreak: Number(e.target.value) }))} className="bg-slate-900 border-slate-800 transition-colors focus:border-indigo-500 h-9" />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-1">Automation</h3>
            
            <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-800/50 hover:bg-slate-900 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-slate-200">Auto-start Breaks</Label>
                <p className="text-xs text-slate-500">Timer starts automatically when focus ends</p>
              </div>
              <Switch checked={lcl.autoStartBreaks} onCheckedChange={(v) => setLcl(s => ({ ...s, autoStartBreaks: v }))} />
            </div>

            <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-800/50 hover:bg-slate-900 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-slate-200">Auto-start Focus</Label>
                <p className="text-xs text-slate-500">Timer starts automatically when break ends</p>
              </div>
              <Switch checked={lcl.autoStartFocus} onCheckedChange={(v) => setLcl(s => ({ ...s, autoStartFocus: v }))} />
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-1">Sound & Alerts</h3>
            
            <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-slate-200">Sound Enabled</Label>
              </div>
              <Switch checked={lcl.soundEnabled} onCheckedChange={(v) => setLcl(s => ({ ...s, soundEnabled: v }))} />
            </div>

            {lcl.soundEnabled && (
              <div className="space-y-3 bg-slate-900 p-4 rounded-lg border border-slate-800">
                <Label className="text-sm text-slate-300">Alert Sound</Label>
                <div className="grid grid-cols-2 gap-2">
                  {soundOptions.map((opt) => (
                    <button key={opt.val} onClick={() => setLcl(s => ({ ...s, selectedSound: opt.val }))}
                      className={`text-xs px-3 py-2 rounded-md border text-left flex items-center justify-between transition-colors ${lcl.selectedSound === opt.val ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300 font-medium' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-800/80 hover:text-slate-300'}`}>
                      {opt.label}
                      {lcl.selectedSound === opt.val && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  ))}
                </div>

                {lcl.selectedSound !== 'none' && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-slate-800">
                    <div className="flex justify-between">
                      <Label className="text-xs text-slate-300">Volume</Label>
                      <span className="text-xs text-slate-500 font-mono">{Math.round(lcl.soundVolume * 100)}%</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.1" value={lcl.soundVolume} onChange={(e) => setLcl(s => ({ ...s, soundVolume: Number(e.target.value) }))}
                      className="w-full accent-indigo-500" />
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        <div className="mt-8 pt-4 flex gap-3 border-t border-slate-800 sticky bottom-0 bg-slate-950">
            <Button variant="ghost" onClick={onClose} className="flex-1 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800">Cancel</Button>
            <Button onClick={save} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium">
              <Save className="w-4 h-4" /> Apply Changes
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
