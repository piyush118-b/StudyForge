"use client";

import { useEffect, useState } from 'react';
import { useTaskStore } from '@/store/task-store';
import { useAuth } from '@/lib/auth-context';
import type { Task } from '@/types/task.types';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskKanban } from '@/components/tasks/TaskKanban';
import { SmartSuggestions } from '@/components/analytics/SmartSuggestions';
import { Button } from '@/components/ui/button';
import { Plus, LayoutList, Columns, Loader2, CalendarDays } from 'lucide-react';
import { isToday, parseISO, addDays, format } from 'date-fns';

export default function TasksPage() {
  const { fetchTasks, getFilteredTasks, getTodayTasks, tasks, loading } = useTaskStore();
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

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
            <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
              <div className="text-6xl animate-bounce">📝</div>
              <h3 className="text-xl font-bold text-white">No tasks yet, yaar!</h3>
              <p className="text-slate-400 max-w-xs">Add your assignments, exams, and study goals here.</p>
              <Button onClick={() => openAddTask()} className="bg-indigo-600 hover:bg-indigo-700">
                Add First Task →
              </Button>
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
