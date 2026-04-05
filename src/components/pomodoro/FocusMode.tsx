"use client";

import { usePomodoro, playAlertSound, triggerFocusConfetti } from '@/hooks/usePomodoro';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { Play, Pause, X } from 'lucide-react';
import { useTaskStore } from '@/store/task-store';

const QUOTES = [
  "बड़े काम के लिए बड़ी मेहनत लगती है। — Keep going!",
  "Focus on the step in front of you, not the whole staircase.",
  "One Pomodoro at a time. You've got this! 🔥",
  "DSA won't solve itself, yaar. Let's go! 💻",
  "Your future self will thank you for this session.",
  "Distractions are the enemy of greatness.",
  "Stay hard! — David Goggins style. 🏃‍♂️",
  "Don't stop when you're tired, stop when you're done."
];

export function FocusMode() {
  const store = usePomodoro();
  const { user } = useAuth();
  const { tasks } = useTaskStore();
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  // Exit full screen with ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirm('Exit Focus Mode? Timer will keep running in the background.')) {
          store.setFocusMode(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentTask = store.currentTaskId ? tasks.find(t => t.id === store.currentTaskId) : null;
  const isFocus = store.phase === 'focus';
  const progressPct = store.totalSeconds > 0 ? (1 - store.secondsRemaining / store.totalSeconds) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0A0A0A] flex flex-col items-center justify-center p-8 overflow-hidden select-none">

      {/* Ambient background glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                       w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.04] pointer-events-none transition-colors duration-1000
                       ${isFocus ? 'bg-[#10B981]' : 'bg-[#3B82F6]'}`} />

      {/* Exit button */}
      <button
        onClick={() => store.setFocusMode(false)}
        className="absolute top-6 right-6 h-9 px-4 rounded-xl border border-[#2A2A2A] bg-transparent text-sm font-medium text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-[#F0F0F0] transition-all duration-150">
        Exit Focus Mode
      </button>

      {/* Main group */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center space-y-10">

        {/* Phase badge */}
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase backdrop-blur-md
            ${isFocus
              ? 'bg-[rgba(16,185,129,0.12)] border-[#10B981]/30 text-[#10B981]'
              : 'bg-[rgba(59,130,246,0.12)] border-[#3B82F6]/30 text-[#3B82F6]'}`}>
            {store.phase.replace('_', ' ')}
          </span>
          {isFocus && store.sessionCount > 0 && (
            <span className="text-[#606060] text-sm font-medium">Session {store.sessionCount + 1}/{store.config.sessionsBeforeLongBreak}</span>
          )}
        </div>

        {/* Task / goal */}
        <div className="flex flex-col items-center gap-2">
          {currentTask ? (
            <>
              {currentTask.subject && <span className="text-[#10B981] font-semibold tracking-wide uppercase text-sm">{currentTask.subject}</span>}
              <h1 className="text-3xl md:text-5xl font-bold text-[#F0F0F0] leading-tight">{currentTask.title}</h1>
            </>
          ) : (
            <h1 className="text-2xl md:text-4xl font-semibold text-[#A0A0A0] font-serif italic">
              "Deep work is the superpower of the 21st century."
            </h1>
          )}
        </div>

        {/* Giant clock */}
        <div className={`text-[110px] md:text-[180px] font-black tracking-tighter tabular-nums leading-none transition-all duration-300
          ${store.isRunning ? 'text-[#F0F0F0]' : 'text-[#F0F0F0]/40'}
          ${store.secondsRemaining < 60 ? '!text-[#EF4444]' : ''}`}
          style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(store.secondsRemaining)}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full max-w-md mx-auto bg-[#1A1A1A] rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ease-linear ${isFocus ? 'bg-[#10B981]' : 'bg-[#3B82F6]'}`}
            style={{ width: `${progressPct}%` }} />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button onClick={store.skip}
            className="h-12 px-8 rounded-full text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#1A1A1A] border border-[#2A2A2A] text-sm font-semibold transition-all duration-150">
            Skip Phase
          </button>

          <button onClick={store.isRunning ? store.pause : store.start}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xl
              ${store.isRunning
                ? 'bg-orange-500 hover:bg-orange-400 text-white shadow-orange-500/20'
                : 'bg-[#10B981] hover:bg-[#34D399] text-[#0A0A0A] shadow-[0_0_40px_rgba(16,185,129,0.4)]'}`}>
            {store.isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current translate-x-1" />}
          </button>

          <button onClick={store.reset}
            className="h-12 px-8 rounded-full text-[#EF4444] hover:text-red-300 hover:bg-[rgba(239,68,68,0.08)] border border-[#2A2A2A] hover:border-[#EF4444]/30 text-sm font-semibold transition-all duration-150">
            Reset
          </button>
        </div>

        {/* Motivational quote */}
        {isFocus && (
          <div className="mt-6 text-[#606060] text-base font-medium tracking-wide">
            {quote}
          </div>
        )}
      </div>
    </div>
  );
}
