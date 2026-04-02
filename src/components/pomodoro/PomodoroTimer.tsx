"use client";

import { usePomodoro, playAlertSound, triggerFocusConfetti } from '@/hooks/usePomodoro';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { Settings, Play, Pause, SkipForward, RotateCcw, Maximize2, MoreVertical, Link2, X } from 'lucide-react';
import { PomodoroSettings } from './PomodoroSettings';
import { FocusMode } from './FocusMode';
import { useTaskStore } from '@/store/task-store';

export function PomodoroTimer() {
  const store = usePomodoro();
  const { user } = useAuth();
  const { tasks } = useTaskStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showTaskLink, setShowTaskLink] = useState(false);
  
  // Need a wrapper reference for Draggable bounds to work smoothly in React 18 strict mode
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
  
  const phaseStyles = {
    focus: { text: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/30", stroke: "#6366f1", label: "🍅 FOCUS" },
    short_break: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", stroke: "#10b981", label: "☕ SHORT BREAK" },
    long_break: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", stroke: "#3b82f6", label: "🛋 LONG BREAK" },
    idle: { text: "text-slate-400", bg: "bg-slate-800", border: "border-slate-700", stroke: "#475569", label: "🍅 POMODORO" }
  };
  const ps = phaseStyles[store.phase];

  const currentTask = store.currentTaskId ? tasks.find(t => t.id === store.currentTaskId) : null;

  return (
    <>
      <Draggable handle=".drag-handle" nodeRef={nodeRef} bounds="parent"
        defaultPosition={{ x: window.innerWidth - 320, y: window.innerHeight - 440 }}>
        
        <div ref={nodeRef} className={`fixed z-[100] w-72 bg-slate-950/95 backdrop-blur-xl border ${ps.border} rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-colors duration-500 shadow-indigo-500/5`}>
          
          {/* Header (Draggable Area) */}
          <div className={`drag-handle flex items-center justify-between px-4 py-3 cursor-move bg-slate-900/40 border-b border-slate-800/60`}>
            <span className={`text-xs font-bold tracking-widest flex items-center gap-1.5 ${ps.text}`}>
              {ps.label}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowSettings(true)} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => store.toggleVisibility()} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex flex-col items-center py-8 relative">
            <svg viewBox="0 0 120 120" className="w-40 h-40 transform -rotate-90 filter drop-shadow-md">
              <circle cx="60" cy="60" r="54" className="stroke-slate-800 fill-none" strokeWidth="6" />
              <circle cx="60" cy="60" r="54" className="fill-none transition-all duration-1000 ease-linear"
                stroke={ps.stroke} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={339.29} strokeDashoffset={339.29 - (pct / 100) * 339.29} 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-4xl font-extrabold font-mono text-white tracking-tight">{formatTime(store.secondsRemaining)}</span>
              
              {/* Session Dots */}
              {store.phase !== 'long_break' && (
                <div className="flex items-center gap-1.5 mt-3">
                  {Array.from({ length: store.config.sessionsBeforeLongBreak }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < store.sessionCount ? ps.text.replace('text-', 'bg-') : 'bg-slate-700'}`} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 px-6 pb-6">
            <button onClick={store.reset} className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors bg-slate-900/50">
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <button onClick={store.isRunning ? store.pause : store.start} 
              className={`p-4 rounded-2xl flex items-center justify-center transition-all ${store.isRunning ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'}`}>
              {store.isRunning ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current translate-x-0.5" />}
            </button>

            <button onClick={store.skip} className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors bg-slate-900/50">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Linked Task / Focus Mode */}
          <div className="px-4 py-3 border-t border-slate-800/80 bg-slate-900/40 mt-auto">
            {currentTask ? (
              <div className="flex justify-between items-center group relative">
                <div className="flex flex-col min-w-0 flex-1 pr-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Working on</span>
                  <span className="text-xs text-slate-200 truncate">{currentTask.title}</span>
                </div>
                <button onClick={store.unlinkAll} className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <button onClick={() => setShowTaskLink(!showTaskLink)} className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors border border-transparent hover:border-indigo-500/20">
                  <Link2 className="w-3.5 h-3.5" /> Link Task
                </button>
                
                {/* Mini Dropdown Picker */}
                {showTaskLink && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50 p-1">
                    {tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').map(t => (
                      <button key={t.id} onClick={() => { store.linkToTask(t.id, t.subject || undefined); setShowTaskLink(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-indigo-600/20 rounded hover:text-white truncate">
                        {t.title}
                      </button>
                    ))}
                    {tasks.length === 0 && <div className="p-3 text-xs text-slate-500 text-center">No active tasks</div>}
                  </div>
                )}
              </div>
            )}

            <button onClick={() => store.setFocusMode(true)} className="w-full mt-2 py-2 flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors shadow-inner">
              <Maximize2 className="w-3.5 h-3.5" /> FOCUS MODE
            </button>
          </div>

        </div>
      </Draggable>

      <PomodoroSettings open={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
