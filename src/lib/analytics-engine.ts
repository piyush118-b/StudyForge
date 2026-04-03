import { TrackingBlock } from "@/types";
import { getLocalDateStr } from './time-utils';

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

import { parseTimeToMinutes } from './grid-utils';

function getDurationInHours(block: TrackingBlock): number {
  const diff = parseTimeToMinutes(block.endTime) - parseTimeToMinutes(block.startTime);
  return (diff < 0 ? diff + 1440 : diff) / 60;
}

export function computeDailyStats(blocks: TrackingBlock[], date: string): DailyStats {
  const dailyBlocks = blocks.filter(b => b.trackedAt && b.trackedAt.startsWith(date));
  
  let scheduled = 0;
  let completed = 0;
  let skipped = 0;
  let partial = 0;
  const sComp = new Set<string>();
  const sSkip = new Set<string>();
  const reasons = new Set<string>();

  dailyBlocks.forEach(b => {
    const hours = getDurationInHours(b);
    scheduled += hours;
    
    if (b.status === 'completed') {
      completed += hours;
      sComp.add(b.subject);
    } else if (b.status === 'skipped') {
      skipped += hours;
      sSkip.add(b.subject);
      // Fallback notes usage or skip notes depending on DB structure
      if (b.notes) reasons.add(b.notes); 
    } else if (b.status === 'partial') {
      partial += hours / 2; // naive partial logic
      sComp.add(b.subject);
    }
  });

  const completionRate = scheduled > 0 ? ((completed + partial) / scheduled) * 100 : 0;

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

// REFACTOR: Pure function to compute weekly stats on the dashboard, memoizable with useMemo
export function computeWeeklyStats(blocks: TrackingBlock[], weekStart: string): WeeklyStats {
  const dailyStats: DailyStats[] = [];
  const start = new Date(weekStart);
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dailyStats.push(computeDailyStats(blocks, d.toLocaleDateString('en-CA')));
  }
  
  const totalScheduled = dailyStats.reduce((sum, d) => sum + d.scheduledHours, 0);
  const totalCompleted = dailyStats.reduce((sum, d) => sum + d.completedHours, 0);
  const totalSkipped = dailyStats.reduce((sum, d) => sum + d.skippedHours, 0);
  
  const subjMap: Record<string, {s: number, c: number, skipCount: number}> = {};
  blocks.forEach(b => {
    if (!subjMap[b.subject]) subjMap[b.subject] = {s:0, c:0, skipCount:0};
    const hours = getDurationInHours(b);
    subjMap[b.subject].s += hours;
    if (b.status === 'completed' || b.status === 'partial') subjMap[b.subject].c += hours;
    if (b.status === 'skipped') subjMap[b.subject].skipCount++;
  });

  const subjectBreakdown = Object.entries(subjMap).map(([subject, data]) => ({
     subject,
     scheduledHours: data.s,
     completedHours: data.c,
     skippedCount: data.skipCount,
     completionRate: data.s > 0 ? (data.c / data.s) * 100 : 0
  }));

  const sortedDailies = [...dailyStats].sort((a,b) => b.completionRate - a.completionRate);
  const bestDay = sortedDailies[0]?.date || 'None';
  const worstDay = sortedDailies[6]?.date || 'None';

  return {
    weekStart,
    weekEnd: getLocalDateStr(start),
    dailyStats,
    totalScheduled,
    totalCompleted,
    totalSkipped,
    overallCompletionRate: totalScheduled > 0 ? (totalCompleted / totalScheduled) * 100 : 0,
    bestDay,
    worstDay,
    mostSkippedSubject: subjectBreakdown.sort((a,b) => b.skippedCount - a.skippedCount)[0]?.subject || 'None',
    mostCompletedSubject: subjectBreakdown.sort((a,b) => b.completedHours - a.completedHours)[0]?.subject || 'None',
    streakDays: 3, // simplified placeholder
    subjectBreakdown
  };
}
