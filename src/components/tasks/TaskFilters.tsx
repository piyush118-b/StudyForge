"use client";

import { useTaskStore } from '@/store/task-store';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function TaskFilters() {
  const { tasks, filter, setFilter, sortBy, setSortBy, searchQuery, setSearch, getOverdueTasks } = useTaskStore();

  const activeTasks = tasks.filter((t) => t.status !== 'cancelled');
  const counts = {
    all: activeTasks.length,
    pending: activeTasks.filter((t) => t.status === 'pending').length,
    in_progress: activeTasks.filter((t) => t.status === 'in_progress').length,
    completed: activeTasks.filter((t) => t.status === 'completed').length,
    overdue: getOverdueTasks().length,
  };

  const subjects = [...new Set(activeTasks.map((t) => t.subject).filter(Boolean))] as string[];

  const statusFilters: { id: typeof filter; label: string }[] = [
    { id: 'all', label: '📂 All' },
    { id: 'pending', label: '📋 Pending' },
    { id: 'in_progress', label: '⚡ In Progress' },
    { id: 'completed', label: '✅ Done' },
    { id: 'overdue', label: '⏰ Overdue' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-800 text-white text-sm"
        />
        {searchQuery && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status Filters */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 mb-2">Status</p>
        {statusFilters.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${filter === id ? 'bg-indigo-600/20 text-indigo-300 font-medium' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'}`}
          >
            <span>{label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${filter === id ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
              {counts[id]}
            </span>
          </button>
        ))}
      </div>

      {/* Subject Filter */}
      {subjects.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 mb-2">Subjects</p>
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSearch(sub)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Sort By */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 mb-2">Sort By</p>
        {(['due_date', 'priority', 'subject', 'created_at'] as const).map((sort) => (
          <button
            key={sort}
            onClick={() => setSortBy(sort)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === sort ? 'text-indigo-300 font-medium' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'}`}
          >
            {{ due_date: '📅 Due Date', priority: '🔥 Priority', subject: '📚 Subject', created_at: '🕑 Created' }[sort]}
          </button>
        ))}
      </div>

      {/* Clear */}
      {(filter !== 'all' || searchQuery || sortBy !== 'due_date') && (
        <button
          onClick={() => { setFilter('all'); setSearch(''); setSortBy('due_date'); }}
          className="text-xs text-rose-400 hover:text-rose-300 transition-colors text-center"
        >
          ✕ Clear filters
        </button>
      )}
    </div>
  );
}
