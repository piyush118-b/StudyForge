"use client";

import { useMemo } from 'react';
import { DailyFocus } from '@/types/analytics.types';
import { format, subDays, startOfDay } from 'date-fns';

interface HeatmapProps {
  data: DailyFocus[];
}

export function Heatmap({ data }: HeatmapProps) {
  // Generate last 30 days grid
  const days = useMemo(() => {
    const today = startOfDay(new Date());
    const arr = [];
    const map = new Map(data.map(d => [d.date, d.minutes]));

    for (let i = 29; i >= 0; i--) {
      const d = subDays(today, i);
      const str = format(d, 'yyyy-MM-dd');
      arr.push({
        date: d,
        dateStr: str,
        minutes: map.get(str) || 0
      });
    }
    return arr;
  }, [data]);

  const maxMins = Math.max(...days.map(d => d.minutes), 60);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-6">Activity Heatmap</h3>
      
      <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] gap-2 sm:gap-3">
        {days.map((day) => {
          const intensity = day.minutes === 0 ? 0 : Math.max(0.1, Math.min(1, day.minutes / maxMins));
          
          return (
            <div key={day.dateStr} className="relative group aspect-square">
              <div 
                className={`w-full h-full rounded-md transition-all ${day.minutes > 0 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-slate-800'}`}
                style={{ opacity: intensity > 0 ? 0.3 + intensity * 0.7 : 1 }}
              />
              {/* Tooltip */}
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 text-xs text-white px-3 py-1.5 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                <span className="font-semibold block">{format(day.date, 'MMM d, yyyy')}</span>
                <span className="text-indigo-300">{day.minutes} mins focused</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center justify-between mt-6 text-xs text-slate-500">
        <span>Less</span>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-slate-800" />
          <div className="w-3 h-3 rounded-sm bg-indigo-500/40" />
          <div className="w-3 h-3 rounded-sm bg-indigo-500/70" />
          <div className="w-3 h-3 rounded-sm bg-indigo-500" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
