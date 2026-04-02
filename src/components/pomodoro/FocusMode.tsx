"use client";

import { usePomodoro, playAlertSound, triggerFocusConfetti } from '@/hooks/usePomodoro';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { Play, Pause, X, Zap } from 'lucide-react';
import { useTaskStore } from '@/store/task-store';
import { Button } from '@/components/ui/button';

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

  return (
    <div className="fixed inset-0 z-[9999] bg-[#090d18] text-white flex flex-col items-center justify-center p-8 overflow-hidden select-none">
      
      {/* Background Gradient Orbs */}
      <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 pointer-events-none transition-colors duration-1000 ${isFocus ? 'bg-indigo-600' : 'bg-emerald-600'}`} />
      <div className={`absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-20 pointer-events-none transition-colors duration-1000 ${isFocus ? 'bg-purple-600' : 'bg-blue-600'}`} />

      {/* Top Bar Navigation */}
      <button onClick={() => store.setFocusMode(false)} className="absolute top-8 right-8 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all backdrop-blur-sm group">
        <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Main Content Group */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center space-y-12">
        
        {/* Phase Indicator */}
        <div className="flex items-center gap-3 animate-fade-in-down">
          <span className={`px-4 py-1.5 rounded-full border border-white/10 text-sm font-bold tracking-widest uppercase shadow-lg backdrop-blur-md ${isFocus ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
            {store.phase.replace('_', ' ')}
          </span>
          {isFocus && store.sessionCount > 0 && (
            <span className="text-white/40 text-sm font-medium">Session {store.sessionCount + 1}/{store.config.sessionsBeforeLongBreak}</span>
          )}
        </div>

        {/* Task Title / Focus Goal */}
        <div className="flex flex-col items-center gap-2">
          {currentTask ? (
            <>
              {currentTask.subject && <span className="text-indigo-400 font-semibold tracking-wide uppercase text-sm">{currentTask.subject}</span>}
              <h1 className="text-3xl md:text-5xl font-bold text-white/90 leading-tight">
                {currentTask.title}
              </h1>
            </>
          ) : (
            <h1 className="text-2xl md:text-4xl font-semibold text-white/60 font-serif italic">
              "Deep work is the superpower of the 21st century."
            </h1>
          )}
        </div>

        {/* THE CLOCK */}
        <div className="relative group perspective-1000">
          <div className={`text-[120px] md:text-[200px] font-black tracking-tighter tabular-nums leading-none transition-all duration-300 ${store.isRunning ? 'text-white' : 'text-white/40'} ${store.secondsRemaining < 60 ? 'text-rose-400' : ''}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(store.secondsRemaining)}
          </div>
          
          {/* Progress Bar (Underneath) */}
          <div className="h-2 w-full max-w-md mx-auto bg-white/5 rounded-full overflow-hidden mt-8 shadow-inner shadow-black/50">
             <div className="h-full bg-white/40 rounded-full transition-all duration-1000 ease-linear"
               style={{ width: `${(1 - store.secondsRemaining / store.totalSeconds) * 100}%` }}
             />
          </div>
        </div>

        {/* Controls Panel */}
        <div className="flex items-center gap-6 mt-8">
          <Button variant="ghost" size="lg" className="h-14 px-8 rounded-full text-white/50 hover:text-white hover:bg-white/10 text-lg transition-all" onClick={store.skip}>
            Skip Phase
          </Button>

          <button onClick={store.isRunning ? store.pause : store.start} 
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95 ${store.isRunning ? 'bg-orange-500 hover:bg-orange-400 text-white shadow-orange-500/20' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/40'}`}>
            {store.isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current translate-x-1" />}
          </button>

          <Button variant="ghost" size="lg" className="h-14 px-8 rounded-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-lg transition-all" onClick={store.reset}>
            Reset
          </Button>
        </div>

        {/* Motivational Footnote */}
        {isFocus && (
          <div className="mt-16 animate-fade-in text-white/40 text-lg font-medium tracking-wide">
            {quote}
          </div>
        )}
      </div>
      
    </div>
  );
}
