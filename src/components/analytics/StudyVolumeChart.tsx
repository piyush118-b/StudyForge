"use client";

import { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, range, refreshKey]);

  if (!isMounted) {
    return (
      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
        <CardContent className="h-[350px] flex items-center justify-center pt-6">
            <Skeleton className="h-full w-full opacity-50" />
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center pt-6">
            <Skeleton className="h-full w-full opacity-50" />
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const scheduled = payload[0].value;
      const completed = payload[1].value;
      const rate = payload[0].payload.completionRate;
      const blocksComp = payload[0].payload.blocksCompleted;
      const blocksTotal = payload[0].payload.blocksTotal;
      // today returns separate integer counts; past days only have the combined float
      const doneBlocks: number | undefined = payload[0].payload.doneBlocks;
      const partialBlocks: number | undefined = payload[0].payload.partialBlocks;
      
      return (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-slate-200 font-bold mb-1.5 border-b border-white/10 pb-1">{label} · {payload[0].payload.date}</p>
          <div className="space-y-1">
            <p className="text-indigo-400 text-xs font-semibold flex items-center justify-between gap-10">
              Scheduled: <span className="text-slate-100 font-mono">{scheduled}h</span>
            </p>
            <p className="text-emerald-400 text-xs font-semibold flex items-center justify-between gap-10">
              Completed: <span className="text-slate-100 font-mono">{completed}h</span>
            </p>
            <div className="pt-2 mt-2 border-t border-white/5 space-y-1">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Progress</p>
                <p className="text-xs text-slate-200 flex items-center justify-between">
                    Rate: <span className={rate >= 80 ? 'text-emerald-400' : 'text-amber-400'}>{rate.toFixed(1)}%</span>
                </p>
                <p className="text-[10px] text-slate-500 italic">
                    {doneBlocks !== undefined
                      ? `${doneBlocks} done${partialBlocks ? ` · ${partialBlocks} partial` : ''} / ${blocksTotal} blocks`
                      : `${Math.floor(blocksComp)} done${blocksComp % 1 !== 0 ? ` · ${Math.round((blocksComp % 1) * 2)} partial` : ''} / ${blocksTotal} blocks`
                    }
                </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl group hover:border-slate-700/50 transition-all duration-300">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    Study Volume
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                    Comparing scheduled blocks vs. actual time logged
                </CardDescription>
            </div>
            <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Weekly Avg</p>
                <p className="text-2xl font-black text-indigo-400 font-mono tracking-tighter">
                   {(data.reduce((acc, curr) => acc + curr.completedHrs, 0) / (data.length || 1)).toFixed(1)}
                   <span className="text-xs font-medium ml-1">h/day</span>
                </p>
            </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-4">
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barGap={0}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                dy={10}
                tick={(props: any) => {
                  const entry = data[props.index];
                  const isToday = entry?.date === todayStr;
                  return (
                    <text
                      x={props.x}
                      y={props.y}
                      textAnchor="middle"
                      fill={isToday ? '#f59e0b' : '#94a3b8'}
                      fontSize={isToday ? 11 : 11}
                      fontWeight={isToday ? 700 : 500}
                    >
                      {isToday ? '● Today' : props.payload.value}
                    </text>
                  );
                }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                unit="h"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '0px', paddingBottom: '20px', fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}
              />
              <Bar 
                  name="Scheduled" 
                  dataKey="scheduledHrs" 
                  fill="#312e81" 
                  radius={[4, 4, 0, 0]} 
                  barSize={12}
                  opacity={0.6}
              />
              <Bar
                  name="Completed"
                  dataKey="completedHrs"
                  fill="url(#emeraldGradient)"
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                  animationDuration={800}
                  animationBegin={100}
              >
                  {data.map((entry, index) => {
                    const isToday = entry.date === todayStr;
                    const overachieved = entry.completedHrs >= entry.scheduledHrs && entry.scheduledHrs > 0;
                    let fill = overachieved ? 'url(#emeraldGradient)' : 'url(#indigoGradient)';
                    if (isToday) fill = 'url(#amberGradient)';
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
              </Bar>
              
              <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8} />
                  </linearGradient>
                  {/* Today's bar gets a distinct amber/gold color */}
                  <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0.9} />
                  </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
