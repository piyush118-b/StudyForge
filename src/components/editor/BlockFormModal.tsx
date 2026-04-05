"use client";

import { useState, useEffect, useRef } from "react";
import { useGridStore } from "@/store/grid-store";
import { type TimeBlock } from "@/lib/grid-engine";
import { X, Search, ChevronDown, Trash2 } from "lucide-react";
import { parseTimeInput, to12Hour, generateQuickTimes, snapTime, timeDiffMinutes } from "@/lib/time-utils";

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', 
  '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b'
];

const STICKERS = ['📚','💻','✍️','🔬','🏃','🧘','☕','🍔','😴','🎉','🌟','🚀'];
const SUBJECT_TYPES = ['Lecture', 'Lab', 'Tutorial', 'Project', 'Revision', 'Break', 'Meal', 'Prayer', 'Gym', 'Buffer', 'Other'];

const DURATION_CHIPS = [
  { label: '15m', mins: 15 },
  { label: '30m', mins: 30 },
  { label: '45m', mins: 45 },
  { label: '1h', mins: 60 },
  { label: '1.5h', mins: 90 },
  { label: '2h', mins: 120 },
  { label: '3h', mins: 180 },
];

export function BlockFormModal() {
  const { blocks, dayColumns, isBlockModalOpen, blockModalData, closeBlockModal, addBlock, updateBlock, deleteBlock, currentSnapInterval } = useGridStore();
  
  const isEditing = !!blockModalData?.blockId;
  const existingBlock = isEditing ? blocks[blockModalData.blockId!] : null;

  const [subject, setSubject] = useState("");
  const [subjectType, setSubjectType] = useState<TimeBlock['subjectType']>('Lecture');
  const [color, setColor] = useState("#3b82f6");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<TimeBlock['priority']>(null);
  const [sticker, setSticker] = useState("");
  
  // Time state bounds
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const [recentSubjects, setRecentSubjects] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('studyforge_recent_subjects');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [isStickerExpanded, setIsStickerExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isBlockModalOpen && blockModalData) {
      if (isEditing && existingBlock) {
        setSubject(existingBlock.subject);
        setSubjectType(existingBlock.subjectType);
        setColor(existingBlock.color);
        setNotes(existingBlock.notes || "");
        setPriority(existingBlock.priority);
        setSticker(existingBlock.sticker || "");
        setStartTime(existingBlock.startTime);
        setEndTime(existingBlock.endTime);
        setIsNotesExpanded(!!existingBlock.notes);
        setIsStickerExpanded(!!existingBlock.sticker);
      } else {
        setSubject("");
        setSubjectType("Other");
        setColor("#3b82f6");
        setNotes("");
        setPriority(null);
        setSticker("");
        setStartTime(blockModalData.startTime);
        setEndTime(blockModalData.endTime);
        setIsNotesExpanded(false);
        setIsStickerExpanded(false);
      }
    }
  }, [isEditing, existingBlock, isBlockModalOpen, blockModalData]);

  if (!isBlockModalOpen || !blockModalData) return null;
  // Reset delete confirm whenever modal closes/reopens
  // (effect not needed — it resets naturally since the component re-renders with fresh state when modal opens)

  const currentDuration = timeDiffMinutes(startTime, endTime);
  const dayName = dayColumns.find(d => d.id === blockModalData.dayId)?.label || "Day";

  // Conflict Detection: match blocks in the same column (dayId or day field)
  const collidingBlock = Object.values(blocks).find(b => {
    const bColId = b.dayId || '';
    const bDay = b.day || '';
    const targetDayId = blockModalData.dayId;
    const targetLabel = dayName;
    if (bColId !== targetDayId && bDay !== targetLabel && bColId !== targetLabel) return false;
    if (isEditing && b.id === existingBlock?.id) return false;
    const s1 = timeDiffMinutes("00:00", b.startTime);
    const e1 = timeDiffMinutes("00:00", b.endTime);
    const s2 = timeDiffMinutes("00:00", startTime);
    const e2 = timeDiffMinutes("00:00", endTime);
    return s1 < e2 && e1 > s2;
  });

  const saveRecentSubject = (subj: string) => {
    let recents = [subj, ...recentSubjects.filter(s => s !== subj)].slice(0, 5);
    setRecentSubjects(recents);
    localStorage.setItem('studyforge_recent_subjects', JSON.stringify(recents));
  };

  const handleSave = () => {
    if (!subject.trim()) return;
    saveRecentSubject(subject.trim());

    const payload = {
      subject,
      subjectType,
      color,
      notes,
      priority: priority || null,
      sticker: sticker || null,
      startTime,
      endTime
    };

    if (isEditing) {
       updateBlock(existingBlock!.id, payload);
    } else {
       addBlock({ dayId: blockModalData.dayId, ...payload });
    }
    closeBlockModal();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#1A1A1A]/98 backdrop-blur-3xl border border-[#2A2A2A] rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] relative flex flex-col font-sans max-h-[90vh] ring-1 ring-[#2A2A2A]/50">
        
        {/* Header */}
        <div className="p-5 border-b border-[#2A2A2A] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-[#F0F0F0] text-[16px] tracking-wide">
              {isEditing ? "Edit Study Block" : "Add Study Block"}
            </h2>
            <span className="text-[11px] font-bold text-[#10B981] bg-[rgba(16,185,129,0.1)] px-2.5 py-1 rounded-full border border-[#10B981]/20">{dayName}</span>
          </div>
          <button onClick={closeBlockModal} className="text-[#606060] hover:text-[#F0F0F0] transition-colors bg-[#222222] p-1.5 rounded-full hover:bg-[#2A2A2A]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 flex-1 overflow-y-auto">
          
          {/* Section: Subject */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606060]" />
              <input 
                autoFocus
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg pl-9 pr-3 py-2.5 text-[14px] text-[#F0F0F0] focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/50 hover:border-[#333333] transition-all font-medium placeholder:text-[#606060]"
                placeholder="Search or type subject name..."
                value={subject}
                onChange={e => setSubject(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSave();
                  }
                }}
              />
            </div>
            {recentSubjects.length > 0 && (
              <div className="flex items-center gap-2 mt-2 px-1">
                <span className="text-[10px] uppercase font-bold text-[#606060] tracking-wider">Recent:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {recentSubjects.map(s => (
                    <button 
                      key={s} 
                      className="text-[11px] bg-[#222222] hover:bg-[#2A2A2A] text-[#A0A0A0] px-2 py-0.5 rounded cursor-pointer transition-colors border border-[#2A2A2A]"
                      onClick={() => setSubject(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <hr className="border-white/5" />

          {/* Section: Time */}
          <div className="space-y-3">
             <div className="flex gap-4 items-center">
                <TimeInput label="Start Time" value={startTime} onChange={setStartTime} snapTo={currentSnapInterval} />
                <span className="text-slate-500 pt-5">→</span>
                <TimeInput label="End Time" value={endTime} onChange={setEndTime} snapTo={currentSnapInterval} />
             </div>
             
             {collidingBlock && (
               <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs px-3 py-2 rounded flex items-center gap-2">
                 <span>⚠️</span>
                 <span>Overlaps with <strong>{collidingBlock.subject}</strong> ({to12Hour(collidingBlock.startTime)}–{to12Hour(collidingBlock.endTime)})</span>
               </div>
             )}

             <div className="space-y-1.5">
               <div className="flex justify-between items-center px-1">
                 <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Duration: {Math.floor(currentDuration/60)}h {currentDuration%60}m</span>
               </div>
               <div className="flex flex-wrap gap-1.5 px-0.5">
                  {DURATION_CHIPS.map(chip => (
                    <button 
                      key={chip.label}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer border
                         ${currentDuration === chip.mins 
                            ? 'bg-forge-accent/20 text-forge-accent border-forge-accent/30 shadow-inner' 
                            : 'bg-forge-overlay/40 text-forge-text-secondary border-transparent hover:bg-forge-overlay hover:text-forge-text-primary'}`}
                      onClick={() => {
                         const startMins = timeDiffMinutes("00:00", startTime);
                         const newEndTotal = startMins + chip.mins;
                         const h = Math.floor(newEndTotal / 60) % 24;
                         const m = newEndTotal % 60;
                         setEndTime(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`);
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
               </div>
             </div>
          </div>

          {/* Section: Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#606060] uppercase tracking-wider">Type</label>
              <div className="relative">
                <select 
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] focus:outline-none focus:ring-1 focus:ring-[#10B981]/50 hover:border-[#333333] transition-all appearance-none cursor-pointer"
                  value={subjectType}
                  onChange={e => setSubjectType(e.target.value as TimeBlock['subjectType'])}
                >
                  {SUBJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-[#606060] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#606060] uppercase tracking-wider">Priority</label>
              <div className="relative">
                <select 
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] focus:outline-none focus:ring-1 focus:ring-[#10B981]/50 hover:border-[#333333] transition-all appearance-none cursor-pointer"
                  value={priority || ""}
                  onChange={e => setPriority((e.target.value as TimeBlock['priority']) || null)}
                >
                  <option value="">Normal</option>
                  <option value="High">🔥 High</option>
                  <option value="Medium">⚡ Medium</option>
                  <option value="Low">🌱 Low</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#606060] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Section: Color Mapping */}
          <div className="space-y-2">
             <label className="text-[11px] font-bold text-[#606060] uppercase tracking-wider w-16">Color</label>
             <div className="flex flex-wrap gap-2 pt-1">
               {COLORS.map(c => (
                 <button 
                   key={c}
                   className={`w-6 h-6 rounded-full transition-transform hover:scale-110 shadow-sm ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1A1A1A] scale-110' : ''}`}
                   style={{ backgroundColor: c }}
                   onClick={() => setColor(c)}
                 />
               ))}
             </div>
          </div>

          <hr className="border-white/5" />

          {/* Accordions */}
          <div className="space-y-2">
            <button 
              className="flex items-center gap-2 text-sm font-medium text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors"
              onClick={() => setIsNotesExpanded(!isNotesExpanded)}
            >
               <span className="w-3 opacity-50 text-[10px]">{isNotesExpanded ? '▼' : '▶'}</span> Notes (optional)
            </button>
            {isNotesExpanded && (
              <div className="pl-5 pr-1 animate-in slide-in-from-top-2 fade-in duration-200 mt-2">
                <textarea 
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F0F0F0] focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/50 hover:border-[#333333] transition-all resize-y min-h-[80px] placeholder:text-[#606060]"
                  placeholder="Syllabus links, tasks, or custom details..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            )}

            <button 
              className="flex items-center gap-2 text-sm font-medium text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors pt-2"
              onClick={() => setIsStickerExpanded(!isStickerExpanded)}
            >
               <span className="w-3 opacity-50 text-[10px]">{isStickerExpanded ? '▼' : '▶'}</span> Sticker {sticker && `(${sticker})`}
            </button>
            {isStickerExpanded && (
              <div className="pl-5 animate-in slide-in-from-top-2 fade-in duration-200 mt-2">
                <div className="flex flex-wrap gap-1.5">
                  <button className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs text-[#606060] border border-transparent hover:bg-white/5`} onClick={() => setSticker("")}>✕</button>
                  {STICKERS.map(s => (
                    <button 
                      key={s}
                      className={`w-10 h-10 rounded-xl hover:bg-[#222222] flex items-center justify-center text-xl transition-colors border ${sticker === s ? 'bg-[#10B981]/20 border-[#10B981]/50 shadow-inner scale-110' : 'border-transparent'}`}
                      onClick={() => setSticker(sticker === s ? '' : s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#2A2A2A] shrink-0 bg-[#0A0A0A] rounded-b-3xl">

          {/* Inline Delete Confirmation Section */}
          {showDeleteConfirm && isEditing && (
            <div className="mb-4 p-4 rounded-2xl bg-red-500/8 border border-red-500/25 animate-in slide-in-from-bottom-2 fade-in duration-200">
              <p className="text-sm font-semibold text-red-400 mb-1">Delete this block?</p>
              <p className="text-xs text-slate-400 mb-4">
                This removes <span className="text-slate-200 font-medium">{existingBlock?.subject}</span> from your timetable.
                Any logged study history for this block will remain in your analytics.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { deleteBlock(existingBlock!.id); closeBlockModal(); }}
                  className="flex-1 px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-[0_4px_16px_rgba(239,68,68,0.3)] transition-all"
                >
                  🗑 Delete Block
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div>
              {isEditing && (
                <button
                  onClick={() => setShowDeleteConfirm(s => !s)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all border ${
                    showDeleteConfirm
                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                      : 'text-[#A0A0A0] hover:bg-red-500/10 hover:text-red-400 border-transparent hover:border-red-500/20'
                  }`}
                  title="Delete Block"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeBlockModal}
                className="px-5 py-2.5 text-sm font-medium text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#222222] rounded-xl transition-colors border border-transparent"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!subject.trim()}
                className="px-6 py-2.5 text-[15px] bg-[#10B981] hover:bg-[#34D399] text-[#0A0A0A] font-bold rounded-xl shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_16px_rgba(16,185,129,0.15)] border border-[#10B981]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-[0.97]"
              >
                {isEditing ? 'Save Changes' : 'Add Block'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Inline Flexible TimeInput component internally parsing 12hr strings to 24hr absolute binds
function TimeInput({ value, onChange, label, snapTo }: { value: string, onChange: (t: string) => void, label: string, snapTo: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync display formatting exactly when modal is mounted or value prop pushes external changes natively
  useEffect(() => {
    setInputValue(to12Hour(value).split(' ')[0]);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const isPM = parseInt(value.split(':')[0]) >= 12;

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{label}</label>
      
      {/* 2-Part Container for Smart Toggle */}
      <div className="flex bg-forge-base border border-forge-border rounded-lg overflow-hidden focus-within:border-forge-accent/50 focus-within:ring-1 focus-within:ring-forge-accent/50 transition-all shadow-inner">
        <input
          className="w-full bg-transparent pl-3 pr-1 py-2 text-sm text-forge-text-primary focus:outline-none cursor-text tracking-wide tabular-nums"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            const typedHasAMPM = e.target.value.toLowerCase().includes('m');
            const strToParse = typedHasAMPM ? e.target.value : `${e.target.value} ${isPM ? 'PM' : 'AM'}`;
            const parsed = parseTimeInput(strToParse);
            if (parsed) onChange(parsed);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              e.preventDefault();
              const typedHasAMPM = inputValue.toLowerCase().includes('m');
              const strToParse = typedHasAMPM ? inputValue : `${inputValue} ${isPM ? 'PM' : 'AM'}`;
              const currentParsed = parseTimeInput(strToParse) || value;
              
              const dir = e.key === 'ArrowUp' ? 1 : -1;
              const step = snapTo || 15;
              
              const [h, m] = currentParsed.split(':').map(Number);
              let total = h * 60 + m + (dir * step);
              if (total < 0) total += 24 * 60;
              
              const newH = Math.floor(total / 60) % 24;
              const newM = total % 60;
              const newTime = `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
              
              const snapped = snapTime(newTime, step as any);
              setInputValue(to12Hour(snapped).split(' ')[0]);
              onChange(snapped);
            }
            if (e.key === 'Enter') {
              e.preventDefault();
              setIsOpen(false);
              (e.target as HTMLInputElement).blur();
            }
          }}
          onBlur={() => {
            const typedHasAMPM = inputValue.toLowerCase().includes('m');
            const strToParse = typedHasAMPM ? inputValue : `${inputValue} ${isPM ? 'PM' : 'AM'}`;
            const parsed = parseTimeInput(strToParse);
            if (parsed) {
              const snapped = parsed; // Allow arbitrary minutes without forced snapping
              setInputValue(to12Hour(snapped).split(' ')[0]);
              onChange(snapped);
            } else {
              setInputValue(to12Hour(value).split(' ')[0]);
            }
            setTimeout(() => setIsOpen(false), 200);
          }}
          placeholder="9:30"
        />
        
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.preventDefault();
            // Toggle AM/PM exactly 12 hours from current resolved store Value
            const [h, m] = value.split(':').map(Number);
            const newH = (h + 12) % 24;
            onChange(`${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
          }}
          className="px-2.5 py-2 text-[11px] font-bold bg-forge-overlay hover:bg-forge-elevated text-forge-accent border-l border-forge-border transition-colors uppercase tracking-widest shrink-0"
        >
          {isPM ? 'PM' : 'AM'}
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute top-100 mt-1 left-0 right-0 z-[100] bg-forge-elevated border border-forge-border rounded-lg max-h-[160px] overflow-y-auto shadow-forge-xl py-1">
          {generateQuickTimes('00:00', '23:59', snapTo || 30).filter(t => timeDiffMinutes('06:00', t) >= 0 && timeDiffMinutes(t, '23:30') >= 0).map(time => (
            <button
              key={time}
              onMouseDown={(e) => { e.preventDefault(); }} // Prevent blur before exact click event triggers
              onClick={() => {
                const finalTarget = time;
                onChange(finalTarget);
                setInputValue(to12Hour(finalTarget).split(' ')[0]);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-3 py-1.5 text-xs font-mono transition-colors border-l-2
                 ${value === time ? 'bg-forge-accent/20 border-forge-accent text-forge-accent' : 'border-transparent text-forge-text-primary hover:bg-forge-overlay'}`
              }
            >
              {to12Hour(time)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
