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
    <div className="flex h-full bg-slate-950 text-slate-100">
      {/* LEFT: Filters */}
      <aside className="hidden lg:block w-60 shrink-0 border-r border-slate-800 p-4 overflow-y-auto">
        <TaskFilters />
      </aside>

      {/* CENTER: Task List / Kanban */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">My Tasks</h1>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
              {filteredTasks.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <Columns className="w-4 h-4" />
            </button>
            <Button onClick={() => openAddTask()} className="bg-indigo-600 hover:bg-indigo-700 text-white ml-2 gap-1.5">
              <Plus className="w-4 h-4" /> Add Task
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          )}

          {!loading && filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center px-6">
              {/* Illustration */}
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">No tasks yet, yaar!</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-xs">
                  Add assignments, exams, and study goals. Try typing one below ↓
                </p>
              </div>

              {/* Smart Quick-Add */}
              <div className="w-full max-w-md">
                <div className="flex gap-2 items-center bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
                  <Plus className="w-4 h-4 text-slate-600 shrink-0" />
                  <input
                    ref={quickInputRef}
                    type="text"
                    value={quickTaskTitle}
                    onChange={(e) => setQuickTaskTitle(e.target.value)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleQuickAdd()}
                    placeholder='e.g. "Submit OS assignment" or "Study Networks 2hrs"'
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleQuickAdd}
                    disabled={!quickTaskTitle.trim() || quickAdding}
                    className="shrink-0 flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {quickAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
                    {quickAdding ? 'Adding...' : 'Add'}
                  </button>
                </div>
                <p className="text-xs text-slate-700 mt-2 text-left pl-1">
                  Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">Enter</kbd> to quickly add · Priority defaults to Medium
                </p>
              </div>

              <button
                onClick={() => openAddTask()}
                className="text-xs text-slate-600 hover:text-indigo-400 transition-colors underline-offset-2 hover:underline"
              >
                Want more options? Open the full task form →
              </button>
            </div>
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
              onEditTask={(t) => { setEditTask(t); setFormOpen(true); }}
            />
          )}
        </div>
      </main>

      {/* RIGHT: Today's Focus + Upcoming */}
      <aside className="hidden xl:flex flex-col w-72 shrink-0 border-l border-slate-800 overflow-y-auto">
        <SmartSuggestions />
        
        {/* Today's Focus */}
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <span>🎯</span> Today's Focus
          </h2>
          {todayTasks.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">Nothing due today! 🎉</p>
          ) : (
            <div className="space-y-2">
              {todayTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'High' ? 'bg-red-400' : task.priority === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <span className="text-xs text-slate-300 truncate flex-1">{task.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming */}
        <div className="p-4 flex-1">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Upcoming
          </h2>
          {upcomingDays.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">Nothing scheduled this week 🌿</p>
          ) : (
            <div className="space-y-3">
              {upcomingDays.map(({ dateStr, label, tasks: dayTasks }) => (
                <div key={dateStr}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium text-slate-400">{label}</span>
                    <span className="text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full">{dayTasks.length}</span>
                  </div>
                  {dayTasks.slice(0, 3).map((t) => (
                    <p key={t.id} className="text-xs text-slate-500 truncate pl-2 mb-0.5">• {t.title}</p>
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
