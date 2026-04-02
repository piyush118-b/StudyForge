"use client";

import { useTaskStore } from '@/store/task-store';
import { useAuth } from '@/lib/auth-context';
import type { Task } from '@/types/task.types';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Column {
  id: Task['status'];
  label: string;
  color: string;
  dot: string;
}

const COLUMNS: Column[] = [
  { id: 'pending', label: '📋 Pending', color: 'border-slate-700', dot: 'bg-slate-400' },
  { id: 'in_progress', label: '⚡ In Progress', color: 'border-indigo-700/50', dot: 'bg-indigo-400' },
  { id: 'completed', label: '✅ Done', color: 'border-emerald-700/50', dot: 'bg-emerald-400' },
];

interface TaskKanbanProps {
  onAddTask?: (status: Task['status']) => void;
  onEditTask?: (task: Task) => void;
}

export function TaskKanban({ onAddTask, onEditTask }: TaskKanbanProps) {
  const { tasks, updateTask } = useTaskStore();
  const { user } = useAuth();

  const activeTasks = tasks.filter((t) => t.status !== 'cancelled');

  const grouped = COLUMNS.reduce<Record<string, Task[]>>((acc, col) => {
    acc[col.id] = activeTasks.filter((t) => t.status === col.id);
    return acc;
  }, {});

  async function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as Task['status'];

    try {
      // Optimistic update happens inside updateTask
      await updateTask(draggableId, { status: newStatus }, user?.id);
      toast.success(`Moved to ${newStatus.replace('_', ' ')}`);
    } catch {
      toast.error('Failed to move task. Try again?');
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-3 gap-4 h-full min-h-[500px]">
        {COLUMNS.map((col) => {
          const colTasks = grouped[col.id] || [];
          return (
            <div key={col.id} className={`flex flex-col bg-slate-900/40 rounded-xl border ${col.color}`}>
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="text-sm font-semibold text-slate-300">{col.label}</span>
                  <span className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full font-mono">
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 space-y-2 min-h-[200px] transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-500/5' : ''}`}
                  >
                    {colTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={`transition-opacity ${snap.isDragging ? 'opacity-70 rotate-1 scale-105' : ''}`}
                          >
                            <TaskCard task={task} onEdit={onEditTask} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {colTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex items-center justify-center h-24 text-slate-600 text-sm border border-dashed border-slate-800 rounded-lg">
                        Drop tasks here
                      </div>
                    )}
                  </div>
                )}
              </Droppable>

              {/* Add Button */}
              <button
                onClick={() => onAddTask?.(col.id)}
                className="flex items-center justify-center gap-2 py-2.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors border-t border-slate-800"
              >
                <Plus className="w-3.5 h-3.5" /> Add task
              </button>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
