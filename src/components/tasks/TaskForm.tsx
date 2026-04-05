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
import { getLocalDateStr } from '@/lib/time-utils';

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
  const [dueDate, setDueDate] = useState(editTask?.dueDate || getLocalDateStr());
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
      <SheetContent side="right" className="w-full max-w-[480px] bg-[#0A0A0A] border-[#2A2A2A] overflow-y-auto p-6">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold text-[#F0F0F0]">
            {isEditing ? '✏️ Edit Task' : '➕ New Task'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#606060] block">Title *</label>
            <Input
              autoFocus
              placeholder="What needs to get done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#222222] border-[#2A2A2A] text-[#F0F0F0] h-10 text-sm focus:ring-2 focus:ring-[#10B981]/70 focus:border-[#10B981]/50 hover:border-[#333333] transition-all placeholder:text-[#606060]"
            />
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#606060] block">Subject</label>
            <Input
              placeholder="e.g. Data Structures, DBMS..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-[#222222] border-[#2A2A2A] text-[#F0F0F0] focus:ring-2 focus:ring-[#10B981]/70 focus:border-[#10B981]/50 hover:border-[#333333] transition-all placeholder:text-[#606060]"
            />
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#606060] block">Priority</label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  data-active={priority === opt.value}
                  onClick={() => setPriority(opt.value)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${opt.color} ${priority === opt.value ? 'ring-1 ring-offset-1 ring-offset-[#0A0A0A]' : 'opacity-70 hover:opacity-100'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#606060] block">Due Date</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-[#222222] border-[#2A2A2A] text-[#F0F0F0] focus:ring-2 focus:ring-[#10B981]/70 hover:border-[#333333] transition-all"
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
                  className="text-xs text-[#10B981] hover:text-[#34D399] bg-[rgba(16,185,129,0.1)] hover:bg-[rgba(16,185,129,0.15)] px-2.5 py-1 rounded-full transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Time (only shows if due date is set) */}
          {dueDate && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#606060] block">Due Time</label>
              <Input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="bg-[#222222] border-[#2A2A2A] text-[#F0F0F0] font-mono focus:ring-2 focus:ring-[#10B981]/70 hover:border-[#333333] transition-all"
              />
            </div>
          )}

          {/* Estimated Hours */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#606060] block">Estimated Hours</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setEstimatedHours(Math.max(0.25, estimatedHours - 0.25))}
                className="w-8 h-8 rounded-lg bg-[#222222] border border-[#2A2A2A] text-[#F0F0F0] hover:bg-[#2A2A2A] text-lg font-bold transition-colors">−</button>
              <span className="text-[#F0F0F0] font-mono min-w-[60px] text-center">
                {estimatedHours >= 1
                  ? `${Math.floor(estimatedHours)}h ${estimatedHours % 1 ? `${(estimatedHours % 1) * 60}m` : ''}`
                  : `${estimatedHours * 60}m`}
              </span>
              <button type="button" onClick={() => setEstimatedHours(Math.min(24, estimatedHours + 0.25))}
                className="w-8 h-8 rounded-lg bg-[#222222] border border-[#2A2A2A] text-[#F0F0F0] hover:bg-[#2A2A2A] text-lg font-bold transition-colors">+</button>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#606060] block">Tags</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${tags.includes(tag) ? 'bg-[rgba(16,185,129,0.15)] border-[#10B981]/40 text-[#10B981]' : 'border-[#2A2A2A] text-[#606060] hover:border-[#333333] hover:text-[#A0A0A0]'}`}
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
                className="bg-[#222222] border-[#2A2A2A] text-[#F0F0F0] text-sm focus:ring-2 focus:ring-[#10B981]/70 hover:border-[#333333] transition-all placeholder:text-[#606060]"
              />
            </div>
            {tags.filter((t) => !COMMON_TAGS.includes(t)).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-xs bg-[#222222] border border-[#2A2A2A] text-[#A0A0A0] px-2.5 py-1 rounded-full mr-1">
                {tag}
                <button type="button" onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}>
                  <X className="w-3 h-3 hover:text-red-400" />
                </button>
              </span>
            ))}
          </div>

          {/* Reminder */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#606060] block">Reminder</label>
            <select
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(Number(e.target.value))}
              className="w-full bg-[#222222] border border-[#2A2A2A] text-[#F0F0F0] rounded-lg h-9 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/70 hover:border-[#333333] transition-all"
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
            <label className="text-xs font-semibold uppercase tracking-widest text-[#606060] block">Notes</label>
            <textarea
              rows={3}
              placeholder="Add any extra details, links, or formulas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#222222] border border-[#2A2A2A] text-[#F0F0F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/70 hover:border-[#333333] transition-all resize-none placeholder:text-[#606060]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-9 rounded-lg border border-[#2A2A2A] bg-transparent text-sm font-medium text-[#A0A0A0] hover:bg-[#222222] hover:text-[#F0F0F0] hover:border-[#333333] transition-all active:scale-[0.97]">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 h-9 rounded-lg bg-[#10B981] text-[#0A0A0A] text-sm font-bold shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_16px_rgba(16,185,129,0.15)] hover:bg-[#34D399] transition-all active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? 'Update Task →' : 'Save Task →'}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
