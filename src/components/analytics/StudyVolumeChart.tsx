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
  Legend
} from 'recharts';
import { chartTheme } from '@/lib/chart-theme';
import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-[#1A1A1A]", className)} />;
}

interface StudyVolumeChartProps {
  range?: '7d' | '30d' | 'all';
  refreshKey?: number;
}

export function StudyVolumeChart({ range = '7d', refreshKey = 0 }: StudyVolumeChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

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

  if (!isMounted || loading) {
    return (
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
        <Skeleton className="h-4 w-40 mb-1" />
        <Skeleton className="h-3 w-64 mb-6" />
        <Skeleton className="h-[200px] w-full mt-6" />
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
      <h3 className="text-sm font-semibold text-[#F0F0F0] mb-1">
        Weekly Study Volume
      </h3>
      <p className="text-xs text-[#606060] mb-6">
        Scheduled vs. Completed hours this week
      </p>

      <div className="min-w-0" style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
          data={data}
          barGap={4}
          barCategoryGap="25%"
          margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray={chartTheme.gridDashArray}
            stroke={chartTheme.gridColor}
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{
              fill:       chartTheme.axisTickColor,
              fontSize:   chartTheme.axisFontSize,
              fontFamily: chartTheme.axisFontFamily,
            }}
            axisLine={{ stroke: chartTheme.axisColor }}
            tickLine={false}
          />
          <YAxis
            tick={{
              fill:       chartTheme.axisTickColor,
              fontSize:   chartTheme.axisFontSize,
              fontFamily: chartTheme.axisFontFamily,
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}h`}
          />
          <Tooltip
            contentStyle={chartTheme.tooltip.contentStyle}
            labelStyle={chartTheme.tooltip.labelStyle}
            itemStyle={chartTheme.tooltip.itemStyle}
            cursor={chartTheme.tooltip.cursor}
            formatter={(value, name) => [
              `${value}h`,
              name
            ]}
          />
          <Legend wrapperStyle={chartTheme.legend.wrapperStyle} />

          {/* Scheduled bar (background) */}
          <Bar
            dataKey="scheduledHrs"
            fill={chartTheme.bars.scheduled}
            radius={[4, 4, 0, 0]}
            name="Scheduled"
          />

          {/* Completed bar (foreground) */}
          <Bar
            dataKey="completedHrs"
            fill={chartTheme.bars.completed}
            radius={[4, 4, 0, 0]}
            name="Completed"
          />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
