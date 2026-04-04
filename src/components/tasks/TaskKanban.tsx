"use client";

import { useTaskStore } from "@/store/task-store";
import { TaskCard } from "@/components/tasks/TaskCard";
import type { Task, TaskStatus } from "@/types/task.types";
import { Plus } from "lucide-react";

const COLUMNS: { status: TaskStatus; label: string; color: string; accent: string; emoji: string }[] = [
  { status: "pending",     label: "Pending",     color: "border-slate-700",       accent: "bg-slate-500",   emoji: "📝" },
  { status: "in_progress", label: "In Progress", color: "border-indigo-500/40",   accent: "bg-indigo-500",  emoji: "⚡" },
  { status: "completed",   label: "Completed",   color: "border-emerald-500/30",  accent: "bg-emerald-500", emoji: "🎉" },
];

interface TaskKanbanProps {
  onAddTask: (status?: TaskStatus) => void;
  onEditTask: (task: Task) => void;
}

export function TaskKanban({ onAddTask, onEditTask }: TaskKanbanProps) {
  const { tasks } = useTaskStore();

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);

        return (
          <div
            key={col.status}
            className={`flex flex-col min-w-[280px] max-w-[320px] flex-1 bg-slate-900/40 border ${col.color} rounded-xl overflow-hidden`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.accent}`} />
                <span className="text-sm font-semibold text-slate-200">{col.label}</span>
                <span className="text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full font-mono">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => onAddTask(col.status)}
                className="p-1 rounded-md text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                title={`Add to ${col.label}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task Cards */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {colTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center opacity-40">
                  <span className="text-2xl mb-2">{col.emoji}</span>
                  <p className="text-xs text-slate-500">No tasks here</p>
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={onEditTask} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
