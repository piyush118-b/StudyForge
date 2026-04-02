// ============================================================
// Phase 3 – Pomodoro Types
// ============================================================

export interface PomodoroConfig {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  soundVolume: number;          // 0–1
  selectedSound: 'bell' | 'digital' | 'soft' | 'none';
  vibrationEnabled: boolean;
  showNotifications: boolean;
}

export type PomodoroPhase = 'focus' | 'short_break' | 'long_break' | 'idle';

export interface PomodoroState {
  phase: PomodoroPhase;
  secondsRemaining: number;
  totalSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  sessionCount: number;          // focus sessions completed this cycle
  totalFocusToday: number;       // minutes focused today
  currentTaskId: string | null;
  currentBlockId: string | null;
  currentSubject: string | null;
  config: PomodoroConfig;
  sessionStartedAt: string | null;
  isFocusMode: boolean;
  isVisible: boolean;            // floating widget visible
}

export interface PomodoroSession {
  id: string;
  userId: string;
  taskId: string | null;
  blockId: string | null;
  subject: string | null;
  sessionType: PomodoroPhase;
  plannedMinutes: number;
  actualMinutes: number;
  status: 'completed' | 'abandoned' | 'paused';
  focusScore: number | null;
  startedAt: string;
  endedAt: string;
  date: string;
}

export const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true,
  soundVolume: 0.7,
  selectedSound: 'bell',
  vibrationEnabled: true,
  showNotifications: true,
};
