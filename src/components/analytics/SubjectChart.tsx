"use client";

import { SubjectFocus } from '@/types/analytics.types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SubjectChartProps {
  data: SubjectFocus[];
}

export function SubjectChart({ data }: SubjectChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[300px]">
        <h3 className="text-lg font-bold text-white mb-2">Subject Distribution</h3>
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          No data yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[300px]">
      <h3 className="text-lg font-bold text-white mb-2">Subject Distribution</h3>
      
      <div className="flex-1 flex mt-4">
        <div className="flex-1 min-w-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="minutes"
                nameKey="subject"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#f8fafc' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 flex flex-col justify-center space-y-3 pl-4 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
          {data.map((item) => (
            <div key={item.subject} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-slate-300 truncate">{item.subject}</span>
              </div>
              <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
                {Math.floor(item.minutes / 60)}h {item.minutes % 60}m
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
