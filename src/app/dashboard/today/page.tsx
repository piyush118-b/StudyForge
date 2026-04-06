"use client";

import { useEffect, useState, useRef } from "react";
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
import { Skeleton, SkeletonCard, SkeletonBlock } from "@/components/ui/forge-skeleton";
import { EmptyState } from "@/components/ui/forge-empty";

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

  const prevProgressRef = useRef(progressPct);
  
  useEffect(() => {
    if (progressPct === 100 && prevProgressRef.current < 100) {
      import('@/lib/confetti').then(({ fireCompletionConfetti }) => {
        fireCompletionConfetti()
      })
    }
    prevProgressRef.current = progressPct;
  }, [progressPct]);

  if (loadingToday) {
    return (
      <div className="p-6 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard className="col-span-2" />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Block list */}
        <div className="space-y-3 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-8" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!activeTimetable) {
    return (
      <EmptyState
        emoji="📅"
        title="No timetable active"
        description="Create your AI-powered study schedule and come back here to track every block in real-time."
        action={{ label: 'Create Timetable →', href: '/create' }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6 md:p-8 pb-24">
      {/* ── Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F0F0F0]">
          📅 Today&apos;s Schedule
        </h1>
        <p className="text-[#606060] text-sm mt-1">
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
        <div className="bg-[#111111]/50 border border-[#2A2A2A]/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-4">
              <span className="text-emerald-400 font-medium">
                ✅ {dailySummary?.completedBlocks ?? completedCount} done
              </span>
              <span className="text-amber-400">
                ⚡ {dailySummary?.partialBlocks ?? partialCount} partial
              </span>
              <span className="text-[#10B981]">
                ⏳ {leftCount} left
              </span>
              {leftBehindCount > 0 && (
                <span className="text-red-400/80">
                  ⚠️ {leftBehindCount} left behind
                </span>
              )}
            </div>
            <span className="text-[#606060] font-mono text-xs">{Math.round(progressPct)}%</span>
          </div>
          <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden flex gap-px">
            {dailySummary && dailySummary.totalBlocks > 0 ? (
              <>
                <div
                  className="bg-emerald-500 h-full rounded-l-full transition-all duration-150-all duration-700"
                  style={{ width: `${(dailySummary.completedBlocks / dailySummary.totalBlocks) * 100}%` }}
                />
                <div
                  className="bg-amber-500 h-full transition-all duration-150-all duration-700"
                  style={{ width: `${(dailySummary.partialBlocks / dailySummary.totalBlocks) * 100}%` }}
                />
              </>
            ) : (
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-150-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Block Timeline ─────────────────────────────────── */}
      <section className="bg-[#111111] border border-[#2A2A2A] rounded-xl overflow-hidden mt-8">
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-[#F0F0F0]">Today&apos;s Schedule</h2>
            <span className="
              text-[10px] font-semibold px-1.5 py-0.5 rounded
              bg-[#222222] border border-[#2A2A2A] text-[#606060]
            ">
              {sortedBlocks.length} blocks
            </span>
          </div>

          <p className="text-xs text-[#606060] font-mono">
            {isMounted
              ? new Date(todayDateStr + 'T12:00:00Z').toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })
              : "Loading..."}
          </p>
        </div>

        {sortedBlocks.length === 0 ? (
          <div className="px-6 pb-6">
            <EmptyState
              emoji="✅"
              title="All done for today!"
              description="You have no study blocks scheduled for today. Enjoy your free time or create a new timetable."
              action={{ label: 'Create Timetable', href: '/create' }}
            />
          </div>
        ) : (
          <div className="px-6 pb-6">
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-[#2A2A2A] via-[#2A2A2A] to-transparent" />

              {/* Block items */}
              <div className="space-y-2 pl-8 relative">
                {sortedBlocks.map((block) => (
                  <div key={block.blockId} className="relative">
                    {/* Timeline dot */}
                    <div className={`
                      absolute -left-[29px] top-4
                      w-2.5 h-2.5 rounded-full border-2
                      transition-all duration-300
                      ${block.status === 'completed'
                        ? 'bg-[#10B981] border-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.6)]'
                        : block.status === 'partial'
                        ? 'bg-[#F59E0B] border-[#F59E0B]'
                        : block.status === 'skipped'
                        ? 'bg-[#EF4444] border-[#EF4444]'
                        : block.isCurrent
                        ? 'bg-[#3B82F6] border-[#3B82F6] shadow-[0_0_6px_rgba(59,130,246,0.6)] animate-pulse'
                        : 'bg-[#2A2A2A] border-[#333333]'
                      }
                    `} />

                    <StudyBlock
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Due Today Tasks Panel ──────────────────────────── */}
      <section className="pt-4 border-t border-[#2A2A2A]/50 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-teal-400" />
            Tasks Due Today
            {todayTasks.length > 0 && (
              <span className="text-xs bg-[#1A1A1A] text-[#A0A0A0] px-1.5 py-0.5 rounded-full font-mono">
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
          <div className="flex items-center gap-3 px-4 py-3 bg-[#111111]/30 border border-[#2A2A2A]/50 rounded-xl">
            <span className="text-lg">✨</span>
            <div>
              <p className="text-sm text-[#A0A0A0]">No tasks due today!</p>
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
                className="flex items-center gap-3 px-4 py-3 bg-[#111111]/40 border border-[#2A2A2A]/60 rounded-xl group hover:border-[#2A2A2A] transition-all duration-150-colors"
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
                  className="h-7 text-xs text-teal-500 hover:text-teal-300 hover:bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-all duration-150-opacity shrink-0"
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
