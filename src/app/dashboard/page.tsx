"use client";

import { useGridStore } from "@/store/grid-store";
import { useAnalyticsStore } from "@/store/analytics-store";
import { useTrackingStore } from "@/store/tracking-store";
import { useTaskStore } from "@/store/task-store";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { computeWeeklyStats, WeeklyStats } from "@/lib/analytics-engine";
import Link from "next/link";
import { Database } from "@/types/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Flame,
  CalendarClock,
  TrendingUp,
  ArrowRight,
  Plus,
  Loader2,
  FilePlus,
  CheckSquare,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getLocalDateStr } from "@/lib/time-utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { WeeklyAIInsights } from "@/components/dashboard/WeeklyAIInsights";
import { TimetableCard } from "@/components/timetable/TimetableCard";
import { StudyBlock } from "@/components/dashboard/StudyBlock";
import { cn } from "@/lib/utils";

type TimetableRow = Database["public"]["Tables"]["timetables"]["Row"];

// ─── Performance Header ───────────────────────────────────────────────────────
function PerformanceHeader({ stats }: { stats: WeeklyStats }) {
  const rate = Math.round(stats.overallCompletionRate);
  const balanceScore = Math.round(rate * 0.8 + 20);
  const rateColor = rate > 70 ? "text-emerald-400" : rate > 40 ? "text-amber-400" : "text-rose-400";
  const barColor = rate > 70 ? "bg-emerald-500" : rate > 40 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center gap-5 relative overflow-hidden">
      {/* glow */}
      <div className="absolute -top-10 -right-10 w-52 h-52 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

      {/* This Week */}
      <div className="flex-1 space-y-2 z-10">
        <p className="text-xs font-medium tracking-widest text-slate-500 uppercase">This Week</p>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-4xl font-extrabold tabular-nums", rateColor)}>{rate}%</span>
          <span className="text-slate-500 text-sm font-medium">completion</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-1000", barColor)}
            style={{ width: `${Math.min(100, Math.max(3, rate))}%` }}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-16 bg-slate-800" />

      {/* Streak */}
      <div className="z-10 flex flex-col gap-2">
        <p className="text-xs font-medium tracking-widest text-slate-500 uppercase flex items-center gap-1.5">
          <Flame className="w-3 h-3 text-orange-400" /> Streak
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-bold text-white">{stats.streakDays}</span>
          <span className="text-slate-500 text-sm">days</span>
        </div>
        <div className="flex items-center gap-1">
          {stats.dailyStats.map((d, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-sm"
              title={`${d.date}: ${d.completionRate}%`}
              style={{
                backgroundColor:
                  d.completionRate > 70 ? "#f97316" : d.completionRate > 0 ? "#fb923c55" : "#1e293b",
              }}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-16 bg-slate-800" />

      {/* Balance Score */}
      <div className="z-10 flex flex-col gap-2">
        <p className="text-xs font-medium tracking-widest text-slate-500 uppercase flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-blue-400" /> Balance
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">{balanceScore}</span>
          <span className="text-slate-500 text-sm">/ 100</span>
        </div>
        <div className="text-xs text-slate-600 max-w-[120px] leading-tight">
          <WeeklyAIInsights weeklyStats={stats} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { blocks } = useGridStore();
  const { eventQueue } = useAnalyticsStore();
  const { user } = useAuth();
  const router = useRouter();

  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [timetables, setTimetables] = useState<TimetableRow[]>([]);
  const [loadingTimetables, setLoadingTimetables] = useState(true);

  const {
    todayBlocks,
    loadTodayBlocks,
    loadingToday,
    markBlockDone,
    markBlockPartial,
    markBlockSkipped,
    undoBlockMark,
  } = useTrackingStore();

  const { getTodayTasks, markComplete, tasks } = useTaskStore();

  const todayDate = getLocalDateStr();
  const todayTasks = getTodayTasks();

  // Weekly stats from event queue
  useEffect(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 3);
    setWeeklyStats(computeWeeklyStats(eventQueue as any[], getLocalDateStr(weekStart)));
  }, [eventQueue, blocks]);

  // Load timetables + today blocks
  useEffect(() => {
    async function load() {
      if (!user) { setLoadingTimetables(false); return; }
      try {
        const { data, error } = await supabase
          .from("timetables")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });
        if (error) throw error;
        const rows = (data || []) as TimetableRow[];
        setTimetables(rows);

        const active = rows.find((t) => t.is_active);
        if (active) {
          const gridData = active.grid_data as any;
          loadTodayBlocks(active.id, gridData, todayDate);
        }
      } catch {
        toast.error("Could not load your timetables.");
      } finally {
        setLoadingTimetables(false);
      }
    }
    load();
  }, [user]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const tid = toast.loading("Deleting...");
    try {
      const { error } = await supabase.from("timetables").delete().eq("id", id);
      if (error) throw error;
      setTimetables((p) => p.filter((t) => t.id !== id));
      toast.success("Deleted", { id: tid });
    } catch {
      toast.error("Failed to delete", { id: tid });
    }
  };

  if (!weeklyStats) {
    return (
      <div className="flex h-full items-center justify-center p-8 min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Next 2 pending blocks
  const upNextBlocks = todayBlocks.filter((b) => b.status === "pending").slice(0, 2);

  return (
    <div className="w-full min-h-full font-sans text-slate-100 p-6 md:p-8 space-y-8 pb-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-5%] right-[-5%] w-[700px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-[100%] pointer-events-none" />

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex justify-between items-end z-10 relative">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {getGreeting()}, {user?.user_metadata?.full_name?.split(" ")[0] || "Student"} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Button onClick={() => router.push("/create")} className="bg-indigo-600 hover:bg-indigo-700 hidden sm:flex gap-2">
          <Plus className="w-4 h-4" /> New Timetable
        </Button>
      </div>

      {/* ── Performance Header ─────────────────────────────── */}
      <section className="relative z-10">
        <PerformanceHeader stats={weeklyStats} />
      </section>

      {/* ── Up Next ────────────────────────────────────────── */}
      <section className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-indigo-400" />
            Up Next
          </h2>
          <Link
            href="/dashboard/today"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            Full schedule <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingToday ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
          </div>
        ) : upNextBlocks.length === 0 ? (
          <div className="flex items-center gap-4 p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-sm font-medium text-slate-300">All caught up for today!</p>
              <p className="text-xs text-slate-600">No pending study blocks remaining.</p>
            </div>
            <Link href="/dashboard/today" className="ml-auto text-xs text-indigo-400 hover:underline">
              View all →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {upNextBlocks.map((block) => (
              <StudyBlock
                key={block.blockId}
                block={block}
                mode="compact"
                todayDate={todayDate}
                onDone={markBlockDone}
                onPartial={markBlockPartial}
                onSkip={markBlockSkipped}
                onUndo={undoBlockMark}
              />
            ))}
            {todayBlocks.filter((b) => b.status === "pending").length > 2 && (
              <Link
                href="/dashboard/today"
                className="flex items-center justify-center py-2 text-xs text-slate-500 hover:text-indigo-400 transition-colors"
              >
                +{todayBlocks.filter((b) => b.status === "pending").length - 2} more blocks →
              </Link>
            )}
          </div>
        )}
      </section>

      {/* ── Today's Tasks (mini) ───────────────────────────── */}
      {todayTasks.length > 0 && (
        <section className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-teal-400" />
              Due Today
            </h2>
            <Link
              href="/dashboard/tasks"
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
            >
              All tasks <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {todayTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/40 border border-slate-800/60 rounded-xl"
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    task.priority === "High" ? "bg-red-400" : task.priority === "Medium" ? "bg-amber-400" : "bg-emerald-400"
                  )}
                />
                <span className="flex-1 text-sm text-slate-300 truncate">{task.title}</span>
                {task.subject && <span className="text-xs text-slate-600 hidden sm:block">{task.subject}</span>}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs text-teal-500 hover:text-teal-300 hover:bg-teal-500/10 shrink-0"
                  onClick={() => markComplete(task.id, user?.id)}
                >
                  ✓ Done
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── My Timetables (compact strip) ─────────────────── */}
      <section className="relative z-10 space-y-3 pt-4 border-t border-slate-800/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">My Timetables</h2>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/timetables" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Manage all →
            </Link>
            <Button
              size="sm"
              onClick={() => router.push("/create")}
              className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 h-7 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" /> New
            </Button>
          </div>
        </div>

        {loadingTimetables ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
          </div>
        ) : timetables.length === 0 ? (
          <div className="flex items-center gap-4 p-5 bg-slate-900/30 border border-dashed border-slate-800 rounded-xl">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shrink-0">
              <FilePlus className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">No timetables yet</p>
              <p className="text-xs text-slate-500 mt-0.5">Let AI build your perfect week in 60 seconds.</p>
            </div>
            <Button size="sm" onClick={() => router.push("/create")} className="ml-auto bg-indigo-600 hover:bg-indigo-700 shrink-0">
              Create <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        ) : (
          // Horizontal scroll strip — max 3 visible, scroll for more
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800">
            {timetables.slice(0, 5).map((tt) => (
              <div key={tt.id} className="shrink-0 w-72">
                <TimetableCard
                  timetable={tt}
                  onSetActive={() => {}}
                  onDelete={() => handleDelete(tt.id, tt.title)}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
