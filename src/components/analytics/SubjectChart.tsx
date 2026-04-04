"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
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
  // Optional: start/end time for "Now Studying" detection
  startTime?: string;
  endTime?: string;
}

interface SubjectChartProps {
  refreshKey?: number;
  date?: string;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-800/60", className)} />;
}

// Circular progress ring for the completion metric
function CompletionRing({ done, partial, total }: { done: number; partial: number; total: number }) {
  const r = 30;
  const circumference = 2 * Math.PI * r;
  const donePercent = total > 0 ? done / total : 0;
  const partialPercent = total > 0 ? partial / total : 0;
  const doneDash = circumference * donePercent;
  const partialDash = circumference * partialPercent;
  const pendingDash = circumference * (1 - donePercent - partialPercent);

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: 80, height: 80 }}>
      <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
        {/* Track */}
        <circle cx="40" cy="40" r={r} fill="none" stroke="#1e293b" strokeWidth="7" />
        {/* Partial (amber) — behind done */}
        {partialPercent > 0 && (
          <circle
            cx="40" cy="40" r={r} fill="none"
            stroke="#f59e0b"
            strokeWidth="7"
            strokeDasharray={`${partialDash + doneDash} ${circumference - partialDash - doneDash}`}
            strokeLinecap="round"
          />
        )}
        {/* Done (emerald) — on top */}
        {donePercent > 0 && (
          <circle
            cx="40" cy="40" r={r} fill="none"
            stroke="#10b981"
            strokeWidth="7"
            strokeDasharray={`${doneDash} ${circumference - doneDash}`}
            strokeLinecap="round"
          />
        )}
      </svg>
      {/* Center label */}
      <div className="absolute flex flex-col items-center justify-center leading-none">
        <span className="text-[18px] font-black text-white">{done}</span>
        <span className="text-[10px] text-slate-500 font-medium">/{total}</span>
      </div>
    </div>
  );
}

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function isBlockActive(startTime?: string, endTime?: string, now: Date = new Date()): boolean {
  if (!startTime || !endTime) return false;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= startMins && nowMins < endMins;
}

export function SubjectChart({ refreshKey = 0, date }: SubjectChartProps) {
  const [subjects, setSubjects] = useState<SubjectEntry[]>([]);
  const [dayName, setDayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const now = useNow();

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, refreshKey, date]);

  if (!isMounted) {
    return (
      <Card className="bg-[#0A0C14] border-white/5">
        <CardContent className="h-[220px] flex items-center justify-center pt-6">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-[#0A0C14] border-white/5">
        <CardContent className="p-5 space-y-3">
          <div className="flex gap-4">
            <Skeleton className="w-20 h-20 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 pt-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (subjects.length === 0) {
    return (
      <Card className="bg-[#0A0C14] border-white/5">
        <CardContent className="flex flex-col items-center justify-center h-[200px] gap-3">
          <div className="text-3xl">📚</div>
          <p className="text-slate-500 text-sm text-center max-w-xs">
            No blocks scheduled for <span className="text-slate-300">{dayName}</span>.
          </p>
        </CardContent>
      </Card>
    );
  }

  const done = subjects.filter(s => s.status === 'completed').length;
  const partial = subjects.filter(s => s.status === 'partial').length;
  const totalPlanned = subjects.reduce((acc, s) => acc + s.plannedHours, 0);
  const totalActual = subjects.reduce((acc, s) => acc + s.totalActualHours, 0);
  // "remaining" = sum of planned hours for subjects not yet completed/partially done
  // This correctly handles the case where some blocks have no log entry yet
  const remaining = subjects
    .filter(s => s.status === 'pending' || s.status === 'skipped')
    .reduce((acc, s) => acc + s.plannedHours, 0);
  // Add partial remainder too (planned - actual for partial blocks)
  const partialRemaining = subjects
    .filter(s => s.status === 'partial')
    .reduce((acc, s) => acc + Math.max(s.plannedHours - s.totalActualHours, 0), 0);
  const totalRemaining = Math.max(remaining + partialRemaining, 0);

  return (
    <Card className="bg-[#0A0C14] border-white/5 shadow-2xl group hover:border-white/10 transition-all duration-300 overflow-hidden">
      <CardContent className="p-5">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Today's Subjects
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_6px_rgba(99,102,241,0.7)] inline-block" />
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{dayName} · {totalRemaining > 0 ? <span className="text-amber-400 font-semibold">{totalRemaining.toFixed(1)}h remaining</span> : <span className="text-emerald-400 font-semibold">All done 🎉</span>}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold mb-0.5">Completion</p>
            <p className="text-[11px] text-slate-400 font-mono">{totalActual.toFixed(1)}<span className="text-slate-600">/{totalPlanned.toFixed(1)}h</span></p>
          </div>
        </div>

        {/* Two-column Bento Layout */}
        <div className="flex gap-5 items-start">
          {/* LEFT: Completion Ring */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <CompletionRing done={done} partial={partial} total={subjects.length} />
            <div className="flex items-center gap-2 text-[10px]">
              {done > 0 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /><span className="text-slate-500">{done} done</span></span>}
              {partial > 0 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /><span className="text-slate-500">{partial} partial</span></span>}
            </div>
          </div>

          {/* RIGHT: Subject compact list */}
          <div className="flex-1 space-y-2.5 min-w-0">
            {subjects.map((s) => {
              const isActive = isBlockActive(s.startTime, s.endTime, now);
              const progressPct = s.plannedHours > 0 ? Math.min((s.totalActualHours / s.plannedHours) * 100, 100) : 0;
              const remainingHrs = Math.max(s.plannedHours - s.totalActualHours, 0);

              const barColor = s.color;

              const textColor =
                s.status === 'completed' ? 'text-emerald-400' :
                s.status === 'partial'   ? 'text-amber-400'   :
                isActive                 ? 'text-indigo-300'  :
                                           'text-slate-400';

              return (
                <div
                  key={s.subject}
                  className={cn(
                    "relative rounded-lg p-2 transition-all duration-300",
                    isActive
                      ? "bg-indigo-500/8 border border-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.1)]"
                      : "bg-transparent"
                  )}
                >
                  {/* "Now Studying" badge */}
                  {isActive && (
                    <span className="absolute top-1.5 right-2 flex items-center gap-1 text-[9px] font-bold text-indigo-300 uppercase tracking-wider">
                      <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse inline-block" />
                      Now
                    </span>
                  )}

                  {/* Subject name + time inline */}
                  <div className="flex items-center justify-between mb-1 pr-8">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className={cn("text-[12px] font-semibold truncate", textColor)}>
                        {s.subject}
                      </span>
                      {s.status === 'completed' && (
                        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1 py-px rounded shrink-0">✓</span>
                      )}
                      {s.status === 'skipped' && (
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-800 px-1 py-px rounded shrink-0">skip</span>
                      )}
                    </div>

                    {/* Actionable hours */}
                    <span className="text-[10px] font-mono shrink-0">
                      {s.status === 'completed'
                        ? <span className="text-emerald-400 font-semibold">{s.totalActualHours.toFixed(1)}/{s.plannedHours.toFixed(1)}h</span>
                        : s.totalActualHours > 0
                        ? <><span className="text-amber-400 font-semibold">{s.totalActualHours.toFixed(1)}</span><span className="text-slate-500">/{s.plannedHours.toFixed(1)}h</span></>
                        : <span className="text-slate-500">{s.plannedHours.toFixed(1)}h</span>
                      }
                    </span>
                  </div>

                  {/* Slim progress bar */}
                  <div className="relative h-[4px] rounded-full overflow-hidden" style={{ backgroundColor: `${s.color}20` }}>
                    {/* Progress fill */}
                    {progressPct > 0 && (
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                        style={{ width: `${progressPct}%`, backgroundColor: barColor, opacity: s.status === 'partial' ? 0.8 : 1 }}
                      />
                    )}
                    {/* Glow for active */}
                    {isActive && progressPct > 0 && (
                      <div
                        className="absolute inset-y-0 left-0 rounded-full blur-[2px] opacity-60 transition-all duration-700"
                        style={{ width: `${progressPct}%`, backgroundColor: '#6366f1' }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
