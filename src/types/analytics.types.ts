// ============================================================
// Phase 3 – Analytics Types
// ============================================================

export interface DailyFocus {
  date: string;       // YYYY-MM-DD
  minutes: number;
}

export interface SubjectFocus {
  subject: string;
  minutes: number;
  color?: string;
}

export interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
}

export interface AnalyticsData {
  dailyFocus: DailyFocus[];
  subjectFocus: SubjectFocus[];
  streak: StudyStreak;
  totalFocusThisWeek: number;
  totalSessionsThisWeek: number;
}
