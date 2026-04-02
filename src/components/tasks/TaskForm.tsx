"use client";

import { useState } from 'react';
import { useTaskStore } from '@/store/task-store';
import { useAuth } from '@/lib/auth-context';
import type { Task, TaskFormData, TaskPriority } from '@/types/task.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const COMMON_TAGS = ['📝 Assignment', '📖 Study', '🧪 Lab', '📊 Project', '🎯 Exam Prep', '💻 Coding'];
const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'High', label: '🔥 High', color: 'border-red-500/30 bg-red-500/10 text-red-400 data-[active=true]:bg-red-500/20' },
  { value: 'Medium', label: '⚡ Medium', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400 data-[active=true]:bg-amber-500/20' },
  { value: 'Low', label: '🌱 Low', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 data-[active=true]:bg-emerald-500/20' },
];

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  editTask?: Task | null;
  defaultStatus?: Task['status'];
}

export function TaskForm({ open, onClose, editTask, defaultStatus = 'pending' }: TaskFormProps) {
  const { addTask, updateTask } = useTaskStore();
  const { user } = useAuth();
  const isEditing = !!editTask;

  const [title, setTitle] = useState(editTask?.title || '');
  const [description, setDescription] = useState(editTask?.description || '');
  const [subject, setSubject] = useState(editTask?.subject || '');
  const [priority, setPriority] = useState<TaskPriority>(editTask?.priority || 'Medium');
  const [dueDate, setDueDate] = useState(editTask?.dueDate || '');
  const [dueTime, setDueTime] = useState(editTask?.dueTime || '');
  const [estimatedHours, setEstimatedHours] = useState<number>(editTask?.estimatedHours || 1);
  const [tags, setTags] = useState<string[]>(editTask?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState(editTask?.notes || '');
  const [reminderMinutes, setReminderMinutes] = useState(editTask?.reminderMinutes || 30);
  const [isRecurring, setIsRecurring] = useState(editTask?.isRecurring || false);
  const [loading, setLoading] = useState(false);

  function toggleTag(tag: string) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  function addCustomTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput('');
  }

  function quickDate(offset: number) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    setDueDate(format(d, 'yyyy-MM-dd'));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { toast.error('Title is required'); return; }
    setLoading(true);
    try {
      const data: TaskFormData = {
        title: title.trim(),
        description: description || undefined,
        subject: subject || undefined,
        priority,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        estimatedHours: estimatedHours || undefined,
        tags,
        notes: notes || undefined,
        reminderMinutes,
      };

      if (isEditing && editTask) {
        await updateTask(editTask.id, data as Partial<Task>, user?.id);
        toast.success('✅ Task updated!');
      } else {
        await addTask(data, user?.id);
        toast.success('✅ Task added!');
      }
      onClose();
    } catch {
      toast.error('Oops! Something glitched 😅 Try again?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full max-w-[480px] bg-slate-950 border-slate-800 overflow-y-auto p-6">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold text-white">
            {isEditing ? '✏️ Edit Task' : '➕ New Task'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Title *</Label>
            <Input
              autoFocus
              placeholder="What needs to get done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-900 border-slate-800 text-white h-11 text-base focus:border-indigo-500"
            />
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Subject</Label>
            <Input
              placeholder="e.g. Data Structures, DBMS..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-slate-900 border-slate-800 text-white focus:border-indigo-500"
            />
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Priority</Label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  data-active={priority === opt.value}
                  onClick={() => setPriority(opt.value)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${opt.color} ${priority === opt.value ? 'ring-1 ring-offset-1 ring-offset-slate-950' : 'opacity-70 hover:opacity-100'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Due Date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-slate-900 border-slate-800 text-white focus:border-indigo-500"
            />
            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'Today', offset: 0 },
                { label: 'Tomorrow', offset: 1 },
                { label: 'This weekend', offset: 6 - new Date().getDay() },
                { label: 'Next week', offset: 7 },
              ].map(({ label, offset }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => quickDate(offset)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-full transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Time (only shows if due date is set) */}
          {dueDate && (
            <div className="space-y-1.5">
              <Label className="text-slate-300">Due Time</Label>
              <Input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white focus:border-indigo-500"
              />
            </div>
          )}

          {/* Estimated Hours */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Estimated Hours</Label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setEstimatedHours(Math.max(0.25, estimatedHours - 0.25))}
                className="w-8 h-8 rounded-lg bg-slate-800 text-white hover:bg-slate-700 text-lg font-bold transition-colors">−</button>
              <span className="text-white font-mono min-w-[60px] text-center">
                {estimatedHours >= 1
                  ? `${Math.floor(estimatedHours)}h ${estimatedHours % 1 ? `${(estimatedHours % 1) * 60}m` : ''}`
                  : `${estimatedHours * 60}m`}
              </span>
              <button type="button" onClick={() => setEstimatedHours(Math.min(24, estimatedHours + 0.25))}
                className="w-8 h-8 rounded-lg bg-slate-800 text-white hover:bg-slate-700 text-lg font-bold transition-colors">+</button>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-slate-300">Tags</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${tags.includes(tag) ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Custom tag + Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
                className="bg-slate-900 border-slate-800 text-white text-sm focus:border-indigo-500"
              />
            </div>
            {tags.filter((t) => !COMMON_TAGS.includes(t)).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full mr-1">
                {tag}
                <button type="button" onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}>
                  <X className="w-3 h-3 hover:text-red-400" />
                </button>
              </span>
            ))}
          </div>

          {/* Reminder */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Reminder</Label>
            <select
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-md h-10 px-3 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value={15}>15 min before</option>
              <option value={30}>30 min before</option>
              <option value={60}>1 hour before</option>
              <option value={1440}>1 day before</option>
              <option value={0}>No reminder</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Notes</Label>
            <textarea
              rows={3}
              placeholder="Add any extra details, links, or formulas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none placeholder:text-slate-600"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 text-slate-400 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? 'Update Task →' : 'Save Task →'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
