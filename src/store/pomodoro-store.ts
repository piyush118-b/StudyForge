import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { PomodoroConfig, PomodoroPhase, PomodoroState, DEFAULT_POMODORO_CONFIG, PomodoroSession } from '@/types/pomodoro.types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'sf_pomodoro_config';
const GUEST_SESSIONS_KEY = 'sf_guest_pomodoro_sessions';

function loadConfig(): PomodoroConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_POMODORO_CONFIG };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_POMODORO_CONFIG, ...JSON.parse(raw) } : { ...DEFAULT_POMODORO_CONFIG };
  } catch {
    return { ...DEFAULT_POMODORO_CONFIG };
  }
}

interface PomodoroStore extends PomodoroState {
  start: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  reset: () => void;
  setPhase: (phase: PomodoroPhase) => void;
  tick: () => void;
  updateConfig: (config: Partial<PomodoroConfig>) => void;
  linkToTask: (taskId: string, subject?: string) => void;
  linkToBlock: (blockId: string, subject?: string) => void;
  unlinkAll: () => void;
  toggleVisibility: () => void;
  setFocusMode: (isFocus: boolean) => void;
  onFocusComplete: (userId?: string) => Promise<void>;
  onBreakComplete: () => void;
}

const initialConfig = loadConfig();

export const usePomodoroStore = create<PomodoroStore>((set, get) => ({
  phase: 'idle',
  secondsRemaining: initialConfig.focusMinutes * 60,
  totalSeconds: initialConfig.focusMinutes * 60,
  isRunning: false,
  isPaused: false,
  sessionCount: 0,
  totalFocusToday: 0,
  currentTaskId: null,
  currentBlockId: null,
  currentSubject: null,
  config: initialConfig,
  sessionStartedAt: null,
  isFocusMode: false,
  isVisible: false,

  start: () => {
    const { phase, config } = get();
    if (phase === 'idle') {
      set({
        phase: 'focus',
        secondsRemaining: config.focusMinutes * 60,
        totalSeconds: config.focusMinutes * 60,
        isRunning: true,
        isPaused: false,
        sessionStartedAt: new Date().toISOString()
      });
    } else {
      set({ isRunning: true, isPaused: false });
    }
  },

  pause: () => set({ isRunning: false, isPaused: true }),
  
  resume: () => set({ isRunning: true, isPaused: false }),

  skip: () => {
    const { phase } = get();
    if (phase === 'focus') get().onFocusComplete();
    else if (phase === 'short_break' || phase === 'long_break') get().onBreakComplete();
  },

  reset: () => {
    const { phase, config } = get();
    let mins = config.focusMinutes;
    if (phase === 'short_break') mins = config.shortBreakMinutes;
    if (phase === 'long_break') mins = config.longBreakMinutes;
    
    set({
      secondsRemaining: mins * 60,
      totalSeconds: mins * 60,
      isRunning: false,
      isPaused: false,
      sessionStartedAt: null
    });
  },

  setPhase: (phase) => {
    const { config } = get();
    let mins = config.focusMinutes;
    if (phase === 'short_break') mins = config.shortBreakMinutes;
    if (phase === 'long_break') mins = config.longBreakMinutes;
    
    set({
      phase,
      secondsRemaining: mins * 60,
      totalSeconds: mins * 60,
      isRunning: false,
      isPaused: false,
      sessionStartedAt: null
    });
  },

  tick: () => {
    const { isRunning, secondsRemaining, phase } = get();
    if (!isRunning || secondsRemaining <= 0) return;
    
    const next = secondsRemaining - 1;
    set({ secondsRemaining: next });
    
    if (next === 0) {
      if (phase === 'focus') get().onFocusComplete();
      else get().onBreakComplete();
    }
  },

  updateConfig: (newConfig) => {
    const config = { ...get().config, ...newConfig };
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    set({ config });
  },

  linkToTask: (taskId, subject) => set({ currentTaskId: taskId, currentSubject: subject || null }),
  linkToBlock: (blockId, subject) => set({ currentBlockId: blockId, currentSubject: subject || null }),
  unlinkAll: () => set({ currentTaskId: null, currentBlockId: null, currentSubject: null }),
  
  toggleVisibility: () => set((s) => ({ isVisible: !s.isVisible })),
  setFocusMode: (isFocus) => set({ isFocusMode: isFocus }),

  onFocusComplete: async (userId?: string) => {
    const { config, currentTaskId, currentBlockId, currentSubject, sessionStartedAt, sessionCount, totalFocusToday } = get();
    
    const sessionData = {
      task_id: currentTaskId,
      block_id: currentBlockId,
      subject: currentSubject,
      session_type: 'focus',
      planned_minutes: config.focusMinutes,
      actual_minutes: config.focusMinutes,
      status: 'completed',
      started_at: sessionStartedAt,
      ended_at: new Date().toISOString()
    };

    if (userId && sessionStartedAt) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from('pomodoro_sessions').insert({
        user_id: userId,
        ...sessionData
      } as any);
      if (error) console.error('Failed to log pomodoro:', error);

    } else if (sessionStartedAt) {
      // Guest mode logging
      try {
        const raw = localStorage.getItem(GUEST_SESSIONS_KEY);
        const sessions = raw ? JSON.parse(raw) : [];
        sessions.push({
          id: uuidv4(),
          userId: 'guest',
          ...sessionData,
          date: new Date().toISOString().split('T')[0]
        });
        localStorage.setItem(GUEST_SESSIONS_KEY, JSON.stringify(sessions));
      } catch (e) {
        console.error('Failed to save guest session', e);
      }
    }

    const nextCount = sessionCount + 1;
    const isLongBreak = nextCount % config.sessionsBeforeLongBreak === 0;
    
    set({
      phase: isLongBreak ? 'long_break' : 'short_break',
      sessionCount: nextCount,
      totalFocusToday: totalFocusToday + config.focusMinutes,
      secondsRemaining: (isLongBreak ? config.longBreakMinutes : config.shortBreakMinutes) * 60,
      totalSeconds: (isLongBreak ? config.longBreakMinutes : config.shortBreakMinutes) * 60,
      isRunning: config.autoStartBreaks,
      isPaused: !config.autoStartBreaks,
      sessionStartedAt: config.autoStartBreaks ? new Date().toISOString() : null
    });
  },

  onBreakComplete: () => {
    const { config } = get();
    set({
      phase: 'focus',
      secondsRemaining: config.focusMinutes * 60,
      totalSeconds: config.focusMinutes * 60,
      isRunning: config.autoStartFocus,
      isPaused: !config.autoStartFocus,
      sessionStartedAt: config.autoStartFocus ? new Date().toISOString() : null
    });
  }
}));
