import { BlockEvent } from "@/store/analytics-store";
import { GridState } from "./grid-engine";

export interface DailyStats {
  date: string;
  scheduledHours: number;      // total hours planned
  completedHours: number;      // actually done
  skippedHours: number;        // skipped
  partialHours: number;        // partially done
  completionRate: number;      // completedHours / scheduledHours * 100
  subjectsCompleted: string[];
  subjectsSkipped: string[];
  skippedReasons: string[];
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  dailyStats: DailyStats[];
  totalScheduled: number;
  totalCompleted: number;
  totalSkipped: number;
  overallCompletionRate: number;
  bestDay: string;             // highest completion rate
  worstDay: string;
  mostSkippedSubject: string;
  mostCompletedSubject: string;
  streakDays: number;
  subjectBreakdown: {
    subject: string;
    scheduledHours: number;
    completedHours: number;
    skippedCount: number;
    completionRate: number;
  }[];
}

export interface GrowthInsights {
  completionRateDelta: number;
  studyHoursDelta: number;
  patterns: string[];
  tomorrowPlan: {
    blocks: any[];
    estimatedHours: number;
    recommendation: string;
  };
  suggestions: string[];
}

export function calculateDailyStats(events: BlockEvent[], date: string): DailyStats {
  const dailyEvents = events.filter(e => e.date === date);
  
  let scheduled = 0;
  let completed = 0;
  let skipped = 0;
  let partial = 0;
  const sComp = new Set<string>();
  const sSkip = new Set<string>();
  const reasons = new Set<string>();

  dailyEvents.forEach(e => {
    scheduled += e.scheduledHours;
    if (e.status === 'completed') {
      completed += e.actualHours;
      sComp.add(e.subject);
    } else if (e.status === 'skipped') {
      skipped += e.scheduledHours;
      sSkip.add(e.subject);
      if (e.skipReason) reasons.add(e.skipReason);
    } else if (e.status === 'partial') {
      partial += e.actualHours;
      sComp.add(e.subject); // Counts as partially completed mapping
    }
  });

  const completionRate = scheduled > 0 ? (completed + partial) / scheduled * 100 : 0;

  return {
    date,
    scheduledHours: scheduled,
    completedHours: completed,
    skippedHours: skipped,
    partialHours: partial,
    completionRate: Math.round(completionRate),
    subjectsCompleted: Array.from(sComp),
    subjectsSkipped: Array.from(sSkip),
    skippedReasons: Array.from(reasons)
  };
}

export function calculateWeeklyStats(events: BlockEvent[], weekStart: string): WeeklyStats {
  // Aggregate 7 days
  const dailyStats: DailyStats[] = [];
  const start = new Date(weekStart);
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dailyStats.push(calculateDailyStats(events, d.toISOString().split('T')[0]));
  }
  
  const totalScheduled = dailyStats.reduce((sum, d) => sum + d.scheduledHours, 0);
  const totalCompleted = dailyStats.reduce((sum, d) => sum + d.completedHours, 0);
  const totalSkipped = dailyStats.reduce((sum, d) => sum + d.skippedHours, 0);
  
  // Calculate subjects
  const subjMap: Record<string, {s: number, c: number, skipCount: number}> = {};
  events.forEach(e => {
    if (!subjMap[e.subject]) subjMap[e.subject] = {s:0, c:0, skipCount:0};
    subjMap[e.subject].s += e.scheduledHours;
    if (e.status === 'completed' || e.status === 'partial') subjMap[e.subject].c += e.actualHours;
    if (e.status === 'skipped') subjMap[e.subject].skipCount++;
  });

  const subjectBreakdown = Object.entries(subjMap).map(([subject, data]) => ({
     subject,
     scheduledHours: data.s,
     completedHours: data.c,
     skippedCount: data.skipCount,
     completionRate: data.s > 0 ? (data.c / data.s) * 100 : 0
  }));

  const bestDay = dailyStats.reduce((best, curr) => curr.completionRate > best.completionRate ? curr : best, dailyStats[0]).date;
  const worstDay = dailyStats.reduce((worst, curr) => curr.completionRate < worst.completionRate ? curr : worst, dailyStats[0]).date;

  return {
    weekStart,
    weekEnd: start.toISOString().split('T')[0], // placeholder binding
    dailyStats,
    totalScheduled,
    totalCompleted,
    totalSkipped,
    overallCompletionRate: totalScheduled > 0 ? (totalCompleted / totalScheduled) * 100 : 0,
    bestDay,
    worstDay,
    mostSkippedSubject: subjectBreakdown.sort((a,b) => b.skippedCount - a.skippedCount)[0]?.subject || 'None',
    mostCompletedSubject: subjectBreakdown.sort((a,b) => b.completedHours - a.completedHours)[0]?.subject || 'None',
    streakDays: calculateStreak(events).current,
    subjectBreakdown
  };
}

export function calculateStreak(events: BlockEvent[]): { current: number; best: number; dates: string[] } {
  // Simplistic placeholder for evaluating contiguous non-0 completion rate days
  return { current: 3, best: 14, dates: [] };
}
