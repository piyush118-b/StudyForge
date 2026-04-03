"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SubjectEntry {
  subject: string;
  plannedHours: number;
  completedHours: number;
  partialHours: number;
  totalActualHours: number;
  completionRate: number;
  status: 'completed' | 'partial' | 'pending' | 'skipped';
  color: string;
}

interface SubjectChartProps {
  /** Increment this to force a data re-fetch (e.g. after block marked) */
  refreshKey?: number;
  /** Override date; defaults to today */
  date?: string;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-800", className)} />;
}

const STATUS_COLORS: Record<string, string> = {
  completed: '#10b981',  // emerald
  partial:   '#f59e0b',  // amber
  pending:   '#475569',  // slate
  skipped:   '#374151',  // muted
};

export function SubjectChart({ refreshKey = 0, date }: SubjectChartProps) {
  const [subjects, setSubjects] = useState<SubjectEntry[]>([]);
  const [dayName, setDayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (!isMounted) return;
    async function fetchData() {
      setLoading(true);
      try {
        const params = date ? `?date=${date}` : '';
        const res = await fetch(`/api/analytics/subjects${params}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setSubjects(json.subjects || []);
        setDayName(json.dayName || '');
      } catch (err) {
        console.error('SubjectChart error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  // re-fetch whenever refreshKey changes (block was marked) or date changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, refreshKey, date]);

  // ─── Skeleton before hydration ─────────────────────────────────────
  if (!isMounted) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="h-[320px] flex items-center justify-center pt-6">
          <Skeleton className="h-full w-full opacity-50" />
        </CardContent>
      </Card>
    );
  }

  // ─── Loading ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // ─── Empty state ────────────────────────────────────────────────────
  if (subjects.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-slate-200">Today's Subjects</CardTitle>
          <CardDescription>No blocks scheduled for today.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[200px] gap-3">
          <div className="text-4xl">📚</div>
          <p className="text-slate-500 text-sm text-center max-w-xs">
            Add study blocks to your timetable for <span className="text-slate-300">{dayName}</span> and they'll appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  // ─── Max hours for bar scaling ──────────────────────────────────────
  const maxHours = Math.max(...subjects.map(s => s.plannedHours || s.totalActualHours), 0.1);

  return (
    <Card className="bg-slate-900/50 border-slate-800 shadow-2xl hover:border-slate-700/50 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              Today's Subjects
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              Planned vs. actual hours — {dayName}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Completion</p>
            <p className="text-2xl font-black text-indigo-400 font-mono tracking-tighter">
              {subjects.filter(s => s.status === 'completed').length}
              {subjects.some(s => s.status === 'partial') && (
                <span className="text-amber-400 text-lg font-bold">
                  +{subjects.filter(s => s.status === 'partial').length}
                  <span className="text-[10px] font-medium ml-0.5">p</span>
                </span>
              )}
              <span className="text-slate-500 text-sm font-medium">/{subjects.length}</span>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {subjects.map((s) => {
          const plannedW = ((s.plannedHours || s.totalActualHours) / maxHours) * 100;
          const completedW = (s.completedHours / maxHours) * 100;
          const partialW = (s.partialHours / maxHours) * 100;

          return (
            <div key={s.subject} className="space-y-1.5">
              {/* Subject label row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-sm font-medium text-slate-200 truncate max-w-[140px]">
                    {s.subject}
                  </span>
                  {/* Status badge */}
                  {s.status === 'completed' && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                      ✓ Done
                    </span>
                  )}
                  {s.status === 'partial' && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                      ⚡ Partial
                    </span>
                  )}
                  {s.status === 'skipped' && (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full">
                      ⏭ Skipped
                    </span>
                  )}
                </div>
                {/* Hours label: actual / planned */}
                <span className="text-xs font-mono text-slate-400">
                  {s.totalActualHours > 0
                    ? <><span className={s.status === 'completed' ? 'text-emerald-400' : s.status === 'partial' ? 'text-amber-400' : 'text-slate-400'}>{s.totalActualHours.toFixed(1)}</span>/{s.plannedHours.toFixed(1)}h</>
                    : `${s.plannedHours.toFixed(1)}h planned`
                  }
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative h-5 bg-slate-800 rounded-full overflow-hidden">
                {/* Planned background bar */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-slate-700/60 transition-all duration-500"
                  style={{ width: `${plannedW}%` }}
                />
                {/* Completed bar */}
                {completedW > 0 && (
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                    style={{
                      width: `${completedW}%`,
                      backgroundColor: s.color,
                      opacity: 0.9,
                    }}
                  />
                )}
                {/* Partial bar (stacked on top of completed) */}
                {partialW > 0 && (
                  <div
                    className="absolute inset-y-0 rounded-full transition-all duration-700"
                    style={{
                      left: `${completedW}%`,
                      width: `${partialW}%`,
                      backgroundColor: '#f59e0b',
                      opacity: 0.8,
                    }}
                  />
                )}
                {/* Completion rate label inside/beside bar */}
                {s.completionRate > 0 && (
                  <span className="absolute right-2 inset-y-0 flex items-center text-[10px] font-bold text-white/80">
                    {s.completionRate.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
