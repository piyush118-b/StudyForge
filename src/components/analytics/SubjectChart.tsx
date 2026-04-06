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
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
      <h3 className="text-sm font-semibold text-[#F0F0F0] mb-1">
        Subject Distribution
      </h3>
      <p className="text-xs text-[#606060] mb-4">
        Time spent per subject this week
      </p>

      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={subjects}
              dataKey="plannedHours"
              nameKey="subject"
              cx="50%"
              cy="50%"
              innerRadius={chartTheme.pie.innerRadius}
              outerRadius={chartTheme.pie.outerRadius}
              paddingAngle={chartTheme.pie.paddingAngle}
              cornerRadius={chartTheme.pie.cornerRadius}
              stroke="none"
            >
              {subjects.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={chartTheme.tooltip.contentStyle}
              labelStyle={chartTheme.tooltip.labelStyle}
              itemStyle={chartTheme.tooltip.itemStyle}
              formatter={(value) => [`${Number(value).toFixed(1)}h`, 'Study time']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom legend below chart */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
        {subjects.map((entry: any) => (
          <div key={entry.subject} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                 style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-[#A0A0A0] truncate">{entry.subject}</span>
            <span className="text-xs font-mono text-[#606060] ml-auto">{entry.plannedHours}h</span>
          </div>
        ))}
      </div>
    </div>
  );
}
