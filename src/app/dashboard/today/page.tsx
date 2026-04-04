"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrackingStore } from "@/store/tracking-store";
import { useTaskStore } from "@/store/task-store";
import { useAuth } from "@/lib/auth-context";
import { supabase as createClient } from "@/lib/supabase";
import { StudyBlock } from "@/components/dashboard/StudyBlock";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getLocalDateStr } from "@/lib/time-utils";

export default function TodayTrackingPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Always compute today from the wall clock — never trust the store's cached date
  const REAL_TODAY = getLocalDateStr();

  const [activeTimetable, setActiveTimetable] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  const {
    todayBlocks,
    dailySummary,
    loadTodayBlocks,
    loadingToday,
    markBlockDone,
    markBlockPartial,
    markBlockSkipped,
    undoBlockMark,
    subscribeToTodayUpdates,
  } = useTrackingStore();

  const { getTodayTasks, markComplete, loading: tasksLoading, fetchTasks } = useTaskStore();

  useEffect(() => {
    setIsMounted(true);

    const init = async () => {
      const supabase = createClient;
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      let active: any = null;

      if (authUser && !authError) {
        const { data } = await supabase
          .from("timetables")
          .select("*")
          .eq("user_id", authUser.id)
          .eq("is_active", true)
          .single();
        active = data;
      } else {
        const guestData = JSON.parse(localStorage.getItem("sf_guest_timetables") || "[]");
        active = guestData.find((t: any) => t.is_active);
      }

      if (active) {
        setActiveTimetable(active);
        // Always pass REAL_TODAY — forces a refetch if the store has a stale date from a previous session
        await loadTodayBlocks(active.id, active.grid_data, REAL_TODAY);

        if (authUser) {
          const unsub = subscribeToTodayUpdates(authUser.id, REAL_TODAY);
          return () => unsub();
        }
      }
    };

    init();
    fetchTasks(user?.id);
  }, []);

  // Always use real wall-clock date — never the potentially-stale store value
  const todayDateStr = REAL_TODAY;
  const todayTasks = getTodayTasks();

  // Sort blocks by time
  const parseMin = (t: string) => {
    const m = t?.match(/(\d{1,2}):?(\d{2})/);
    if (!m) return 0;
    return parseInt(m[1]) * 60 + parseInt(m[2]);
  };

  const sortedBlocks = [...todayBlocks].sort((a, b) => parseMin(a.startTime) - parseMin(b.startTime));

  const completedCount = sortedBlocks.filter((b) => b.status === "completed").length;
  const partialCount = sortedBlocks.filter((b) => b.status === "partial").length;
  
  // Left = pending and either current or in the future
  const leftCount = sortedBlocks.filter((b) => b.status === "pending" && (!b.isPast || b.isCurrent)).length;
  // Left Behind = pending but the time has already passed (or manually skipped)
  const leftBehindCount = sortedBlocks.filter((b) => (b.status === "pending" && b.isPast && !b.isCurrent) || b.status === "skipped").length;
  
  const totalCount = sortedBlocks.length;
  // Partials count as 50% toward progress
  const progressPct = totalCount > 0 ? ((completedCount + partialCount * 0.5) / totalCount) * 100 : 0;

  if (loadingToday) {
    return (
      <div className="flex justify-center items-center p-24">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!activeTimetable) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 p-8">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center">
          <span className="text-3xl">📅</span>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-1">No Active Timetable</h3>
          <p className="text-slate-500 text-sm">Set a timetable as active to start tracking your day.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/timetables")}>Go to Timetables</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6 md:p-8 pb-24">
      {/* ── Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          📅 Today&apos;s Schedule
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {isMounted
            ? new Date(todayDateStr + 'T12:00:00Z').toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })
            : "Loading..."}
        </p>
      </div>

      {/* ── Daily Progress Bar ─────────────────────────────── */}
      {totalCount > 0 && (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-4">
              <span className="text-emerald-400 font-medium">
                ✅ {dailySummary?.completedBlocks ?? completedCount} done
              </span>
              <span className="text-amber-400">
                ⚡ {dailySummary?.partialBlocks ?? partialCount} partial
              </span>
              <span className="text-indigo-400">
                ⏳ {leftCount} left
              </span>
              {leftBehindCount > 0 && (
                <span className="text-red-400/80">
                  ⚠️ {leftBehindCount} left behind
                </span>
              )}
            </div>
            <span className="text-slate-500 font-mono text-xs">{Math.round(progressPct)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex gap-px">
            {dailySummary && dailySummary.totalBlocks > 0 ? (
              <>
                <div
                  className="bg-emerald-500 h-full rounded-l-full transition-all duration-700"
                  style={{ width: `${(dailySummary.completedBlocks / dailySummary.totalBlocks) * 100}%` }}
                />
                <div
                  className="bg-amber-500 h-full transition-all duration-700"
                  style={{ width: `${(dailySummary.partialBlocks / dailySummary.totalBlocks) * 100}%` }}
                />
              </>
            ) : (
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Block Timeline ─────────────────────────────────── */}
      <section className="space-y-3">
        {sortedBlocks.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
            <span className="text-4xl">🎉</span>
            <p className="text-slate-400 mt-3 font-medium">No study blocks today!</p>
            <p className="text-slate-600 text-sm mt-1">Rest up and come back tomorrow.</p>
          </div>
        ) : (
          sortedBlocks.map((block) => (
            <StudyBlock
              key={block.blockId}
              block={block}
              mode="detailed"
              todayDate={todayDateStr}
              onDone={async (id, date, rating, energy) => {
                await markBlockDone(id, date, rating, energy);
                toast("Block marked as done 🎉", {
                  action: {
                    label: "Undo",
                    onClick: () => undoBlockMark(id, date),
                  },
                  duration: 8000,
                });
              }}
              onPartial={markBlockPartial}
              onSkip={markBlockSkipped}
              onUndo={undoBlockMark}
            />
          ))
        )}
      </section>

      {/* ── Due Today Tasks Panel ──────────────────────────── */}
      <section className="pt-4 border-t border-slate-800/50 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-teal-400" />
            Tasks Due Today
            {todayTasks.length > 0 && (
              <span className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full font-mono">
                {todayTasks.length}
              </span>
            )}
          </h2>
          <Link href="/dashboard/tasks" className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1">
            All tasks <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {tasksLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
          </div>
        ) : todayTasks.length === 0 ? (
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/30 border border-slate-800/50 rounded-xl">
            <span className="text-lg">✨</span>
            <div>
              <p className="text-sm text-slate-400">No tasks due today!</p>
              <Link href="/dashboard/tasks" className="text-xs text-teal-500 hover:underline">
                Add some tasks →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 px-4 py-3 bg-slate-900/40 border border-slate-800/60 rounded-xl group hover:border-slate-700 transition-colors"
              >
                <span
                  className={cn(
                    "w-2.5 h-2.5 rounded-full shrink-0",
                    task.priority === "High"
                      ? "bg-red-400"
                      : task.priority === "Medium"
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate">{task.title}</p>
                  {task.subject && (
                    <p className="text-xs text-slate-600">{task.subject}</p>
                  )}
                </div>
                <span className="text-xs text-slate-700 shrink-0 hidden sm:block">
                  {task.dueTime || ""}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-teal-500 hover:text-teal-300 hover:bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={() => {
                    markComplete(task.id, user?.id);
                    toast(`"${task.title}" completed!`);
                  }}
                >
                  ✓ Done
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
