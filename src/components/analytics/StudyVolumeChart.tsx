"use client";

import { useEffect, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-800", className)} />;
}

interface StudyVolumeChartProps {
  range?: '7d' | '30d' | 'all';
  /** Increment to force a re-fetch — e.g. after a block is marked */
  refreshKey?: number;
}

export function StudyVolumeChart({ range = '7d', refreshKey = 0 }: StudyVolumeChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const todayStr = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/study-volume?range=${range}`);
        const result = await res.json();
        if (result.data) {
          setData(result.data);
        }
      } catch (err) {
        console.error('StudyVolumeChart error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isMounted, range, refreshKey]);

  if (!isMounted) {
    return (
      <Card className="bg-[#0A0C14] border-white/5 shadow-2xl overflow-hidden">
        <CardContent className="h-[400px] flex items-center justify-center pt-6">
            <Skeleton className="h-full w-full opacity-50" />
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-[#0A0C14] border-white/5 shadow-2xl overflow-hidden">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center pt-6">
            <Skeleton className="h-full w-full opacity-50" />
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const scheduled = payload[1]?.value; // Index 1 is Scheduled in the Area list
      const completed = payload[0]?.value; // Index 0 is Completed
      
      return (
        <div className="bg-[#161821] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-slate-200 font-bold mb-1.5 border-b border-white/5 pb-1">{label} · {payload[0].payload.date}</p>
          <div className="space-y-1">
            <p className="text-indigo-400 text-xs font-semibold flex items-center justify-between gap-10">
              Completed: <span className="text-white font-mono">{completed}h</span>
            </p>
            <p className="text-slate-500 text-xs font-semibold flex items-center justify-between gap-10">
              Scheduled: <span className="text-slate-300 font-mono">{scheduled}h</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const todayData = data.find(d => d.date === todayStr);
  const todayCompleted = todayData?.completedHrs ?? 0;
  const todayScheduled = todayData?.scheduledHrs ?? 0;
  const todayRate = todayScheduled > 0 ? Math.round((todayCompleted / todayScheduled) * 100) : 0;

  return (
    <Card className="bg-[#0A0C14] border-white/5 shadow-2xl overflow-hidden group">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-lg font-bold text-white tracking-tight">Study Volume</CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              Hours scheduled vs hours completed over time.
            </CardDescription>
          </div>
          {/* Today's quick stats chips */}
          {todayScheduled > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-lg px-2.5 py-1.5 text-[11px]">
                <span className="text-slate-400">Today</span>
                <span className="font-bold text-indigo-300">{todayCompleted}h</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">{todayScheduled}h</span>
              </div>
              <div className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold ${
                todayRate >= 80 ? 'bg-emerald-500/15 text-emerald-400' :
                todayRate >= 50 ? 'bg-amber-500/15 text-amber-400' :
                'bg-slate-800/80 text-slate-400'
              }`}>
                {todayRate}%
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-8 pb-4">
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="0" stroke="#ffffff06" vertical={false} />
              
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                dy={12}
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                dx={-8}
              />
              
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#ffffff15', strokeWidth: 1 }}
              />
              
              <Legend 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                wrapperStyle={{ paddingTop: '30px', fontSize: '11px', fontWeight: 600, color: '#64748b' }}
                formatter={(value) => (
                    <span className="text-slate-400 font-medium ml-1">
                        {value === 'completedHrs' ? 'Completed Hrs' : 'Scheduled Hrs'}
                    </span>
                )}
              />

              <Area
                type="monotone"
                dataKey="scheduledHrs"
                stroke="#334155"
                strokeWidth={2}
                fill="transparent"
                strokeDasharray="5 5"
                animationDuration={1500}
                name="scheduledHrs"
              />

              <Area
                type="monotone"
                dataKey="completedHrs"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCompleted)"
                animationDuration={1500}
                name="completedHrs"
                dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    const isToday = payload.date === todayStr;
                    return (
                        <g key={`dot-${payload.date}`}>
                            <circle 
                                cx={cx} cy={cy} r={isToday ? 4 : 3} 
                                fill={isToday ? '#ef4444' : '#6366f1'} 
                                stroke="#0A0C14" 
                                strokeWidth={2} 
                            />
                            {isToday && (
                                <circle 
                                    cx={cx} cy={cy} r={8} 
                                    fill="#ef4444" 
                                    fillOpacity={0.2}
                                    className="animate-ping"
                                />
                            )}
                        </g>
                    );
                }}
                activeDot={{ 
                    r: 6, 
                    fill: '#8b5cf6', 
                    stroke: '#white', 
                    strokeWidth: 2,
                    className: 'shadow-lg shadow-purple-500/50'
                }}
              />

            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
