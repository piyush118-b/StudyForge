import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import type { Task, TaskFormData, TaskStatus, GuestTaskStore } from '@/types/task.types';
import { getLocalDateStr } from '@/lib/time-utils';

const GUEST_KEY = 'sf_guest_tasks';

function readGuestTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (!raw) return [];
    const store = JSON.parse(raw) as GuestTaskStore;
    return store.tasks;
  } catch {
    return [];
  }
}

function writeGuestTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  const store: GuestTaskStore = { tasks, lastUpdated: new Date().toISOString() };
  localStorage.setItem(GUEST_KEY, JSON.stringify(store));
}

const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') return false;
  return new Date(task.dueDate) < new Date(new Date().toDateString());
}

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filter: 'all' | 'pending' | 'in_progress' | 'completed' | 'overdue';
  sortBy: 'due_date' | 'priority' | 'created_at' | 'subject';
  searchQuery: string;

  fetchTasks: (userId?: string) => Promise<void>;
  addTask: (data: TaskFormData, userId?: string) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>, userId?: string) => Promise<void>;
  deleteTask: (id: string, userId?: string) => Promise<void>;
  markComplete: (id: string, userId?: string) => Promise<void>;
  markInProgress: (id: string, userId?: string) => Promise<void>;
  setFilter: (filter: TaskStore['filter']) => void;
  setSortBy: (sort: TaskStore['sortBy']) => void;
  setSearch: (query: string) => void;
  getFilteredTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getTasksBySubject: (subject: string) => Task[];
  getTodayTasks: () => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  filter: 'all',
  sortBy: 'due_date',
  searchQuery: '',

  fetchTasks: async (userId?: string) => {
    set({ loading: true, error: null });
    try {
      if (userId) {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .neq('status', 'cancelled')
          .order('created_at', { ascending: false });
        if (error) throw error;
        // Map snake_case → camelCase
        const tasks: Task[] = (data || []).map(mapRow);
        set({ tasks });
      } else {
        set({ tasks: readGuestTasks() });
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch tasks' });
    } finally {
      set({ loading: false });
    }
  },

  addTask: async (data: TaskFormData, userId?: string): Promise<Task> => {
    const now = new Date().toISOString();
    const task: Task = {
      id: uuidv4(),
      userId: userId || 'guest',
      timetableId: null,
      title: data.title,
      description: data.description || null,
      subject: data.subject || null,
      priority: data.priority,
      status: 'pending',
      dueDate: data.dueDate || null,
      dueTime: data.dueTime || null,
      estimatedHours: data.estimatedHours || null,
      actualHours: 0,
      tags: data.tags || [],
      linkedBlockId: null,
      notes: data.notes || null,
      completionPercentage: 0,
      isRecurring: false,
      recurrenceRule: null,
      reminderMinutes: data.reminderMinutes || 30,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };

    if (userId) {
      const { data: row, error } = await supabase
        .from('tasks')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(mapToRow(task, userId) as any)
        .select()
        .single();
      if (error) throw error;
      const saved = mapRow(row);
      set((s) => ({ tasks: [saved, ...s.tasks] }));
      return saved;
    } else {
      const guestTasks = [...get().tasks, task];
      writeGuestTasks(guestTasks);
      set({ tasks: guestTasks });
      return task;
    }
  },

  updateTask: async (id: string, updates: Partial<Task>, userId?: string) => {
    const updatedAt = new Date().toISOString();
    set((s) => ({
      tasks: s.tasks.map((t) => t.id === id ? { ...t, ...updates, updatedAt } : t),
    }));

    if (userId) {
      const row: Record<string, unknown> = {};
      if (updates.title !== undefined) row.title = updates.title;
      if (updates.description !== undefined) row.description = updates.description;
      if (updates.subject !== undefined) row.subject = updates.subject;
      if (updates.priority !== undefined) row.priority = updates.priority;
      if (updates.status !== undefined) row.status = updates.status;
      if (updates.dueDate !== undefined) row.due_date = updates.dueDate;
      if (updates.dueTime !== undefined) row.due_time = updates.dueTime;
      if (updates.estimatedHours !== undefined) row.estimated_hours = updates.estimatedHours;
      if (updates.actualHours !== undefined) row.actual_hours = updates.actualHours;
      if (updates.tags !== undefined) row.tags = updates.tags;
      if (updates.linkedBlockId !== undefined) row.linked_block_id = updates.linkedBlockId;
      if (updates.notes !== undefined) row.notes = updates.notes;
      if (updates.completionPercentage !== undefined) row.completion_percentage = updates.completionPercentage;
      if (updates.completedAt !== undefined) row.completed_at = updates.completedAt;
      row.updated_at = updatedAt;

      // Supabase generated types are very strict — cast through unknown to satisfy them
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from('tasks').update(row as unknown as never).eq('id', id);
      if (error) throw error;
    } else {
      const tasks = get().tasks;
      writeGuestTasks(tasks);
    }
  },

  deleteTask: async (id: string, userId?: string) => {
    await get().updateTask(id, { status: 'cancelled' }, userId);
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
    if (!userId) writeGuestTasks(get().tasks);
  },

  markComplete: async (id: string, userId?: string) => {
    await get().updateTask(id, {
      status: 'completed',
      completionPercentage: 100,
      completedAt: new Date().toISOString(),
    }, userId);
  },

  markInProgress: async (id: string, userId?: string) => {
    await get().updateTask(id, { status: 'in_progress' }, userId);
  },

  setFilter: (filter) => set({ filter }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSearch: (searchQuery) => set({ searchQuery }),

  getFilteredTasks: () => {
    const { tasks, filter, sortBy, searchQuery } = get();
    let list = tasks.filter((t) => t.status !== 'cancelled');

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.subject?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    if (filter === 'overdue') list = list.filter(isOverdue);
    else if (filter !== 'all') list = list.filter((t) => t.status === filter);

    return list.sort((a, b) => {
      if (sortBy === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sortBy === 'subject') return (a.subject || '').localeCompare(b.subject || '');
      if (sortBy === 'due_date') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  },

  getOverdueTasks: () => get().tasks.filter(isOverdue),

  getTasksBySubject: (subject: string) =>
    get().tasks.filter((t) => t.subject === subject && t.status !== 'cancelled'),

  getTodayTasks: () => {
    const today = getLocalDateStr();
    return get().tasks.filter((t) => {
      if (t.status === 'cancelled' || t.status === 'completed') return false;
      // Task explicitly due today
      if (t.dueDate === today) return true;
      // Task with no due date that was created today in LOCAL time (handles IST etc.)
      if (!t.dueDate && t.createdAt) {
        const localCreatedDate = new Date(t.createdAt).toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD
        if (localCreatedDate === today) return true;
      }
      return false;
    });
  },
}));

// ── DB ↔ Domain mapping helpers ──────────────────────────────

function mapRow(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    timetableId: (row.timetable_id as string) || null,
    title: row.title as string,
    description: (row.description as string) || null,
    subject: (row.subject as string) || null,
    priority: row.priority as Task['priority'],
    status: row.status as Task['status'],
    dueDate: (row.due_date as string) || null,
    dueTime: (row.due_time as string) || null,
    estimatedHours: (row.estimated_hours as number) || null,
    actualHours: (row.actual_hours as number) || 0,
    tags: (row.tags as string[]) || [],
    linkedBlockId: (row.linked_block_id as string) || null,
    notes: (row.notes as string) || null,
    completionPercentage: (row.completion_percentage as number) || 0,
    isRecurring: (row.is_recurring as boolean) || false,
    recurrenceRule: (row.recurrence_rule as string) || null,
    reminderMinutes: (row.reminder_minutes as number) || 30,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    completedAt: (row.completed_at as string) || null,
  };
}

function mapToRow(task: Task, userId: string): Record<string, unknown> {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    description: task.description,
    subject: task.subject,
    priority: task.priority,
    status: task.status,
    due_date: task.dueDate,
    due_time: task.dueTime,
    estimated_hours: task.estimatedHours,
    actual_hours: task.actualHours,
    tags: task.tags,
    linked_block_id: task.linkedBlockId,
    notes: task.notes,
    completion_percentage: task.completionPercentage,
    is_recurring: task.isRecurring,
    recurrence_rule: task.recurrenceRule,
    reminder_minutes: task.reminderMinutes,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    completed_at: task.completedAt,
  };
}
