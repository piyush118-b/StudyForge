"use client";

import { usePomodoro, playAlertSound, triggerFocusConfetti } from '@/hooks/usePomodoro';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { Settings, Play, Pause, SkipForward, RotateCcw, Maximize2, Link2, X } from 'lucide-react';
import { PomodoroSettings } from './PomodoroSettings';
import { FocusMode } from './FocusMode';
import { useTaskStore } from '@/store/task-store';

export function PomodoroTimer() {
  const store = usePomodoro();
  const { user } = useAuth();
  const { tasks } = useTaskStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showTaskLink, setShowTaskLink] = useState(false);

  const nodeRef = useRef(null);

  // Re-trigger sound on 0 inside component context for safety
  useEffect(() => {
    if (store.secondsRemaining === 0) {
      playAlertSound(store.config.selectedSound, store.config.soundVolume, store.config.soundEnabled);
      if (store.phase === 'focus') triggerFocusConfetti();
    }
  }, [store.secondsRemaining, store.phase]);

  if (!store.isVisible && !store.isFocusMode) return null;
  if (store.isFocusMode) return <FocusMode />;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const pct = store.totalSeconds > 0 ? ((store.totalSeconds - store.secondsRemaining) / store.totalSeconds) * 100 : 0;
  const circumference = 2 * Math.PI * 54;

  const phaseColors = {
    focus:       { stroke: '#10B981', border: 'border-[#10B981]/30', label: '🍅 FOCUS',       text: 'text-[#10B981]' },
    short_break: { stroke: '#3B82F6', border: 'border-[#3B82F6]/30', label: '☕ SHORT BREAK', text: 'text-[#3B82F6]' },
    long_break:  { stroke: '#6366F1', border: 'border-[#6366F1]/30', label: '🛋 LONG BREAK',  text: 'text-[#6366F1]' },
    idle:        { stroke: '#2A2A2A', border: 'border-[#2A2A2A]',    label: '🍅 POMODORO',   text: 'text-[#606060]' },
  };
  const pc = phaseColors[store.phase];

  const currentTask = store.currentTaskId ? tasks.find(t => t.id === store.currentTaskId) : null;

  return (
    <>
      <Draggable handle=".drag-handle" nodeRef={nodeRef} bounds="parent"
        defaultPosition={{ x: window.innerWidth - 320, y: window.innerHeight - 440 }}>

        <div ref={nodeRef} className={`fixed z-[100] w-72 bg-[#1A1A1A]/95 backdrop-blur-xl border ${pc.border} rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden transition-colors duration-500`}>

          {/* Header — drag handle */}
          <div className={`drag-handle flex items-center justify-between px-4 py-3 cursor-move bg-[#0A0A0A]/40 border-b ${pc.border}`}>
            <span className={`text-xs font-bold tracking-widest flex items-center gap-1.5 ${pc.text}`}>
              {pc.label}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowSettings(true)} className="p-1.5 rounded-lg text-[#606060] hover:text-[#F0F0F0] hover:bg-[#222222] transition-all duration-150">
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => store.toggleVisibility()} className="p-1.5 rounded-lg text-[#606060] hover:text-[#F0F0F0] hover:bg-[#222222] transition-all duration-150">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Timer display — SVG ring */}
          <div className="flex flex-col items-center py-8 relative">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                {/* Track */}
                <circle cx="60" cy="60" r="54" fill="none" stroke="#1E1E1E" strokeWidth="6" />
                {/* Progress */}
                <circle cx="60" cy="60" r="54" fill="none"
                  stroke={pc.stroke} strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (pct / 100) * circumference}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              {/* Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black font-mono text-[#F0F0F0] tracking-tight tabular-nums leading-none">
                  {formatTime(store.secondsRemaining)}
                </span>

                {/* Session dots */}
                {store.phase !== 'long_break' && (
                  <div className="flex items-center gap-1.5 mt-2">
                    {Array.from({ length: store.config.sessionsBeforeLongBreak }).map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i < store.sessionCount ? 'bg-[#10B981] shadow-[0_0_5px_rgba(16,185,129,0.6)]' : 'bg-[#2A2A2A]'}`} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 px-6 pb-6">
            <button onClick={store.reset}
              className="w-11 h-11 rounded-xl flex items-center justify-center border border-[#2A2A2A] bg-[#1A1A1A] text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#222222] hover:border-[#333333] transition-all duration-150 active:scale-[0.95]">
              <RotateCcw className="w-4 h-4" />
            </button>

            <button onClick={store.isRunning ? store.pause : store.start}
              className={`w-28 h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.97] ${
                store.isRunning
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30'
                  : 'bg-[#10B981] text-[#0A0A0A] shadow-[0_0_0_1px_rgba(16,185,129,0.4),0_0_24px_rgba(16,185,129,0.2)] hover:bg-[#34D399] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.6),0_0_40px_rgba(16,185,129,0.3)]'
              }`}>
              {store.isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
              {store.isRunning ? 'Pause' : 'Start'}
            </button>

            <button onClick={store.skip}
              className="w-11 h-11 rounded-xl flex items-center justify-center border border-[#2A2A2A] bg-[#1A1A1A] text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#222222] hover:border-[#333333] transition-all duration-150 active:scale-[0.95]">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Linked task + Focus Mode */}
          <div className="px-4 py-3 border-t border-[#2A2A2A] bg-[#0A0A0A]/40 mt-auto space-y-2">
            {currentTask ? (
              <div className="flex justify-between items-center group relative">
                <div className="flex flex-col min-w-0 flex-1 pr-2">
                  <span className="text-[10px] uppercase font-bold text-[#606060] tracking-widest">Working on</span>
                  <span className="text-xs text-[#F0F0F0] truncate">{currentTask.title}</span>
                </div>
                <button onClick={store.unlinkAll} className="opacity-0 group-hover:opacity-100 p-1 text-[#606060] hover:text-[#EF4444] transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <button onClick={() => setShowTaskLink(!showTaskLink)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-[#606060] hover:text-[#10B981] hover:bg-[rgba(16,185,129,0.08)] rounded-lg transition-all duration-150 border border-transparent hover:border-[#10B981]/20">
                  <Link2 className="w-3.5 h-3.5" /> Link Task
                </button>

                {showTaskLink && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-h-48 overflow-y-auto z-50 p-1">
                    {tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').map(t => (
                      <button key={t.id} onClick={() => { store.linkToTask(t.id, t.subject || undefined); setShowTaskLink(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-[#A0A0A0] hover:bg-[rgba(16,185,129,0.1)] hover:text-[#F0F0F0] rounded-lg transition-all duration-100 truncate">
                        {t.title}
                      </button>
                    ))}
                    {tasks.length === 0 && <div className="p-3 text-xs text-[#606060] text-center">No active tasks</div>}
                  </div>
                )}
              </div>
            )}

            <button onClick={() => store.setFocusMode(true)}
              className="w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold text-[#A0A0A0] bg-[#222222] hover:bg-[#2A2A2A] hover:text-[#F0F0F0] rounded-xl transition-all duration-150 border border-[#2A2A2A]">
              <Maximize2 className="w-3.5 h-3.5" /> FOCUS MODE
            </button>
          </div>

        </div>
      </Draggable>

      <PomodoroSettings open={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
