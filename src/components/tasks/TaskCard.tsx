"use client";

import { type Task } from '@/types/task.types';
import { useTaskStore } from '@/store/task-store';
import { useAuth } from '@/lib/auth-context';
import { useMemo, useState, useEffect } from 'react';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import {
  CheckCircle2, Circle, ChevronRight, Clock, BookOpen,
  CalendarDays, Zap, MoreHorizontal, Trash2, Edit2,
  Timer, FileText, Link2, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { markComplete, markInProgress, deleteTask } = useTaskStore();
  const { user } = useAuth();
  const [showNotes, setShowNotes] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const priorityConfig = {
    High: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: '🔥 High' },
    Medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: '⚡ Medium' },
    Low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: '🌱 Low' },
  };

  const pc = priorityConfig[task.priority];

  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const dueDateLabel = useMemo(() => {
    if (!task.dueDate || now === null) return null;
    const date = parseISO(task.dueDate);
    const overdue = isPast(date) && !isToday(date) && task.status !== 'completed';
    if (overdue) {
      const days = Math.floor((now - date.getTime()) / 86400000);
      return { text: `⚠️ Overdue by ${days} day${days !== 1 ? '&apos;s' : ''}`, color: 'text-red-400' };
    }
    if (isToday(date)) return { text: '📅 Due today', color: 'text-orange-400' };
    if (isTomorrow(date)) return { text: '📅 Tomorrow', color: 'text-amber-400' };
    return { text: `📅 ${format(date, 'EEE, MMM d')}`, color: 'text-slate-400' };
  }, [task.dueDate, task.status, now]);

  const statusIcon = () => {
    if (task.status === 'completed') return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
    if (task.status === 'in_progress') return <Zap className="w-5 h-5 text-indigo-400 shrink-0" />;
    if (task.status === 'cancelled') return <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />;
    return <Circle className="w-5 h-5 text-slate-500 shrink-0 hover:text-indigo-400 transition-colors" />;
  };

  const barColor = task.completionPercentage === 100
    ? 'bg-emerald-500'
    : task.completionPercentage > 0
      ? 'bg-indigo-500'
      : 'bg-slate-700';

  async function handleToggleComplete() {
    if (task.status === 'completed') {
      await markInProgress(task.id, user?.id);
    } else {
      await markComplete(task.id, user?.id);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#6366f1', '#22c55e', '#f59e0b'] });
      toast.success('✅ Task completed! Great work!');
    }
  }

  function handleDelete() {
    // Smooth fade-out animation
    setDeleting(true);
    setShowMenu(false);

    // Delete after animation, with an undo option
    setTimeout(() => {
      deleteTask(task.id, user?.id);
      toast('Task deleted', {
        description: `"${task.title}" has been removed.`,
        action: {
          label: 'Undo',
          onClick: () => {
            // Note: true undo would require re-inserting the task
            // For now, this just gives a visual acknowledgement
            toast.info('Undo is not available after deletion.');
          },
        },
        duration: 4000,
      });
    }, 300);
  }

  return (
    <div className={`group relative bg-slate-900/60 border rounded-xl p-4 transition-all hover:border-slate-700 hover:bg-slate-900/80
      ${task.status === 'completed' ? 'opacity-60 border-slate-800' : 'border-slate-800'}
      ${deleting ? 'opacity-0 scale-95 -translate-x-4 pointer-events-none' : ''}
    `}
      style={{ transition: 'opacity 0.3s ease, transform 0.3s ease, border-color 0.15s ease' }}
    >
      {/* Header Row */}
      <div className="flex items-start gap-3">
        <button onClick={handleToggleComplete} className="mt-0.5 transition-transform hover:scale-110">
          {statusIcon()}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-semibold text-sm leading-snug ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
              {task.title}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${pc.bg} ${pc.text} ${pc.border}`}>
                {pc.label}
              </span>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden">
                    {onEdit && (
                      <button onClick={() => { onEdit(task); setShowMenu(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                    <button onClick={() => { handleDelete(); setShowMenu(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
          )}

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {task.subject && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <BookOpen className="w-3 h-3" /> {task.subject}
              </span>
            )}
            {dueDateLabel && (
              <span className={`flex items-center gap-1 text-xs font-medium ${dueDateLabel.color}`}>
                <CalendarDays className="w-3 h-3" /> {dueDateLabel.text}
              </span>
            )}
            {task.estimatedHours && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3 h-3" /> {task.estimatedHours}h est.
              </span>
            )}
            {task.tags.length > 0 && task.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500">
                {task.completionPercentage === 0 ? 'Not started' : `${task.completionPercentage}% complete`}
              </span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${task.completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Notes Expansion */}
          {showNotes && task.notes && (
            <div className="mt-3 bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400 leading-relaxed border border-slate-700/50">
              {task.notes}
            </div>
          )}
        </div>
      </div>

      {/* Action Row — shows on hover */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-orange-400 transition-colors px-2 py-1 rounded-md hover:bg-orange-500/10">
          <Timer className="w-3.5 h-3.5" /> Start Pomodoro
        </button>
        {task.notes && (
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors px-2 py-1 rounded-md hover:bg-indigo-500/10"
          >
            <FileText className="w-3.5 h-3.5" /> {showNotes ? 'Hide' : 'Notes'}
          </button>
        )}
        {task.linkedBlockId && (
          <span className="flex items-center gap-1 text-xs text-purple-400 ml-auto">
            <Link2 className="w-3 h-3" /> Linked to block
          </span>
        )}
      </div>
    </div>
  );
}

