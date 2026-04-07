"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { chartTheme } from '@/lib/chart-theme';

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
  return <div className={cn("animate-pulse rounded-md bg-[#1A1A1A]/60", className)} />;
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
        <span className="text-[18px] font-black text-[#F0F0F0]">{done}</span>
        <span className="text-[10px] text-[#606060] font-medium">/{total}</span>
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
          <p className="text-[#606060] text-sm text-center max-w-xs">
            No blocks scheduled for <span className="text-slate-300">{dayName}</span>.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Always use totalActualHours for the pie chart
  const pieDataKey: keyof SubjectEntry = 'totalActualHours';

  const sorted = [...subjects].sort((a, b) => {
    // Rank by actual hours first, then planned hours
    if (a.totalActualHours === 0 && b.totalActualHours > 0) return 1;
    if (b.totalActualHours === 0 && a.totalActualHours > 0) return -1;
    if (a.totalActualHours === b.totalActualHours) {
        return b.plannedHours - a.plannedHours;
    }
    return b.totalActualHours - a.totalActualHours;
  });

  const totalActualToday = subjects.reduce((acc, s) => acc + s.totalActualHours, 0);
  const totalPlannedToday = subjects.reduce((acc, s) => acc + s.plannedHours, 0);
  
  // Center value is always completion time
  const centerValue = totalActualToday;

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#F0F0F0]">Subject Distribution</h3>
          <p className="text-xs text-[#505050] mt-0.5">
            Actual time studied vs planned today
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl font-black text-[#F0F0F0] tabular-nums">{totalActualToday.toFixed(1)}h</div>
          <div className="text-[10px] text-[#505050] uppercase tracking-wider">studied</div>
        </div>
      </div>

      <div className="flex gap-5 items-start">
        {/* Donut chart */}
        <div className="shrink-0 relative" style={{ width: 130, height: 130 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={sorted}
                dataKey={pieDataKey}
                nameKey="subject"
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={58}
                paddingAngle={2}
                cornerRadius={3}
                stroke="none"
              >
                {sorted.map((entry, index) => {
                  const val = Number(entry[pieDataKey]) || 0;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={val === 0 ? 0.2 : 1}
                    />
                  );
                })}
              </Pie>
              <Tooltip
                contentStyle={chartTheme.tooltip.contentStyle}
                labelStyle={chartTheme.tooltip.labelStyle}
                itemStyle={chartTheme.tooltip.itemStyle}
                formatter={(_value, _name, props) => {
                  const s = props.payload as SubjectEntry;
                  const actual = s.totalActualHours;
                  const planned = s.plannedHours;
                  const pct = planned > 0 ? Math.round((actual / planned) * 100) : (actual > 0 ? 100 : 0);
                  const label = `${actual.toFixed(1)}h / ${planned.toFixed(1)}h planned (${pct}%)`;
                  return [label, s.subject];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[17px] font-black text-[#F0F0F0] leading-none tabular-nums">
              {centerValue.toFixed(1)}
            </span>
            <span className="text-[9px] text-[#505050] uppercase tracking-wider mt-0.5">
              done
            </span>
          </div>
        </div>

        {/* Legend — single column, ranked */}
        <div className="flex-1 min-w-0 flex flex-col gap-3 justify-center">
          {sorted.map((s) => {
            const actual = s.totalActualHours;
            const planned = s.plannedHours;
            const pct = planned > 0 ? (actual / planned) * 100 : (actual > 0 ? 100 : 0);
            const isZero = actual === 0 && planned === 0;

            return (
              <div key={s.subject} className={`transition-opacity duration-200 ${isZero ? 'opacity-30' : 'opacity-100'}`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: s.color, boxShadow: isZero ? 'none' : `0 0 4px ${s.color}60` }}
                    />
                    <span className="text-[12px] text-[#C0C0C0] font-medium truncate capitalize">{s.subject}</span>
                  </div>
                  <div className="text-[11px] font-mono shrink-0 tabular-nums">
                    <span className="text-[#F0F0F0] font-medium">{actual.toFixed(1)}h</span>
                    <span className="text-[#606060]"> / {planned.toFixed(1)}h</span>
                  </div>
                </div>
                {/* Mini progress bar */}
                <div className="h-[3px] bg-[#1E1E1E] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      backgroundColor: s.color,
                      opacity: isZero ? 0.3 : 1
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


