"use client";

import { useEffect, useState, useRef, KeyboardEvent } from 'react';
import { useTaskStore } from '@/store/task-store';
import { useAuth } from '@/lib/auth-context';
import type { Task } from '@/types/task.types';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskKanban } from '@/components/tasks/TaskKanban';
import { SmartSuggestions } from '@/components/analytics/SmartSuggestions';
import { Button } from '@/components/ui/button';
import { Plus, LayoutList, Columns, Loader2, CalendarDays, ArrowRight, Sparkles } from 'lucide-react';
import { isToday, parseISO, addDays, format } from 'date-fns';
import { SkeletonTaskCard } from '@/components/ui/forge-skeleton'
import { EmptyState } from '@/components/ui/forge-empty'

export default function TasksPage() {
  const { fetchTasks, getFilteredTasks, getTodayTasks, tasks, loading } = useTaskStore();
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickAdding, setQuickAdding] = useState(false);
  const quickInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTasks(user?.id);
  }, [user?.id]);

  const filteredTasks = getFilteredTasks();
  const todayTasks = getTodayTasks();

  // Upcoming 7 days
  const upcomingDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTasks = tasks.filter((t) =>
      t.dueDate === dateStr && t.status !== 'completed' && t.status !== 'cancelled'
    );
    return { date, dateStr, label: format(date, 'EEE, MMM d'), tasks: dayTasks };
  }).filter((d) => d.tasks.length > 0);

  async function handleQuickAdd() {
    const title = quickTaskTitle.trim();
    if (!title) return;
    setQuickAdding(true);
    try {
      await useTaskStore.getState().addTask({ title, priority: 'Medium' }, user?.id);
      setQuickTaskTitle('');
    } finally {
      setQuickAdding(false);
    }
  }

  function openAddTask(status?: Task['status']) {
    setEditTask(null);
    setFormOpen(true);
  }

  return (
    <div className="flex h-full bg-[#0A0A0A] text-[#F0F0F0]">
      {/* LEFT: Filters */}
      <aside className="hidden lg:block w-60 shrink-0 border-r border-[#2A2A2A] p-4 overflow-y-auto bg-[#111111]">
        <TaskFilters />
      </aside>

      {/* CENTER: Task List / Kanban */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2A] shrink-0 bg-[#111111]/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#F0F0F0]">My Tasks</h1>
            <span className="text-xs bg-[#222222] text-[#A0A0A0] px-2 py-0.5 rounded-full font-mono border border-[#2A2A2A]">
              {filteredTasks.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-150-colors ${viewMode === 'list' ? 'bg-[#10B981] text-[#0A0A0A]' : 'text-[#A0A0A0] hover:bg-[#222222] hover:text-[#F0F0F0]'}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-all duration-150-colors ${viewMode === 'kanban' ? 'bg-[#10B981] text-[#0A0A0A]' : 'text-[#A0A0A0] hover:bg-[#222222] hover:text-[#F0F0F0]'}`}
            >
              <Columns className="w-4 h-4" />
            </button>
            <button onClick={() => openAddTask()} className="h-9 px-4 rounded-lg text-sm font-bold bg-[#10B981] text-[#0A0A0A] shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_16px_rgba(16,185,129,0.15)] hover:bg-[#34D399] transition-all duration-150-all duration-150 active:scale-[0.97] flex items-center gap-1.5 ml-2">
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex gap-4 overflow-x-auto px-1 pb-6 pt-2">
              {Array.from({ length: 3 }).map((_, ci) => (
                <div key={ci} className="flex-shrink-0 w-80">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[#1A1A1A] animate-[forge-shimmer_2s_linear_infinite]" />
                    <div className="h-4 w-24 rounded bg-[#1A1A1A] animate-[forge-shimmer_2s_linear_infinite]" />
                    <div className="h-4 w-8 rounded bg-[#1A1A1A] animate-[forge-shimmer_2s_linear_infinite]" />
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, ti) => (
                      <SkeletonTaskCard key={ti} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredTasks.length === 0 && (
            <EmptyState
              emoji="📋"
              title="No tasks yet"
              description="Add your first task manually or use the OCR scanner to import tasks from a photo of your notes."
              action={{ label: 'Add Your First Task', onClick: openAddTask }}
            />
          )}

          {!loading && filteredTasks.length > 0 && viewMode === 'list' && (
            <div className="space-y-3 max-w-3xl">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={(t) => { setEditTask(t); setFormOpen(true); }} />
              ))}
            </div>
          )}

          {!loading && viewMode === 'kanban' && (
            <TaskKanban
              onAddTask={openAddTask}
              onEditTask={(t: Task) => { setEditTask(t); setFormOpen(true); }}
            />
          )}
        </div>
      </main>

      {/* RIGHT: Today's Focus + Upcoming */}
      <aside className="hidden xl:flex flex-col w-72 shrink-0 border-l border-[#2A2A2A] overflow-y-auto bg-[#111111]">
        <SmartSuggestions />

        {/* Today's Focus */}
        <div className="p-4 border-b border-forge-border">
          <h2 className="text-sm font-semibold text-forge-text-primary mb-3 flex items-center gap-2">
            <span>🎯</span> Today's Focus
          </h2>
          {todayTasks.length === 0 ? (
            <p className="text-xs text-forge-text-muted text-center py-4">Nothing due today! 🎉</p>
          ) : (
            <div className="space-y-2">
              {todayTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-forge-overlay transition-all duration-150-colors">
                  <span className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${task.priority === 'High' ? 'bg-red-400' : task.priority === 'Medium' ? 'bg-orange-400' : 'bg-emerald-400'}`} />
                  <span className="text-xs text-forge-text-primary truncate flex-1">{task.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming */}
        <div className="p-4 flex-1">
          <h2 className="text-sm font-semibold text-forge-text-primary mb-3 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-forge-text-muted" /> Upcoming
          </h2>
          {upcomingDays.length === 0 ? (
            <p className="text-xs text-forge-text-muted text-center py-4">Nothing scheduled this week 🌿</p>
          ) : (
            <div className="space-y-3">
              {upcomingDays.map(({ dateStr, label, tasks: dayTasks }) => (
                <div key={dateStr}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium text-forge-text-secondary">{label}</span>
                    <span className="text-[10px] bg-forge-overlay text-forge-text-secondary px-1.5 py-0.5 rounded-full">{dayTasks.length}</span>
                  </div>
                  {dayTasks.slice(0, 3).map((t) => (
                    <p key={t.id} className="text-[11px] text-forge-text-muted truncate pl-2 mb-0.5">• {t.title}</p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Task Form Sheet */}
      <TaskForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTask(null); }}
        editTask={editTask}
      />
    </div>
  );
}
