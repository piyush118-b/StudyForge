"use client";

import { useTaskStore } from "@/store/task-store";
import { SlidersHorizontal } from "lucide-react";

type FilterValue = 'all' | 'pending' | 'in_progress' | 'completed' | 'overdue';

const FILTERS: { value: FilterValue; label: string; icon: string }[] = [
  { value: "all", label: "All Tasks", icon: "📋" },
  { value: "pending", label: "Pending", icon: "⏳" },
  { value: "in_progress", label: "In Progress", icon: "⚡" },
  { value: "completed", label: "Completed", icon: "✅" },
  { value: "overdue", label: "Overdue", icon: "🔴" },
];

export function TaskFilters() {
  const { filter, setFilter } = useTaskStore();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-semibold text-slate-300">Filter Tasks</span>
      </div>

      <div className="flex flex-col gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-left text-xs px-3 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
              filter === f.value
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <span>{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
